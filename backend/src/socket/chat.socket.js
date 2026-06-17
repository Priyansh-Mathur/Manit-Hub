const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const Friendship = require("../models/Friendship");
const presence = require("./presence");

// Accepted-friend ids for a user, as strings.
const friendIdsOf = async (userId) => {
  const links = await Friendship.find({
    users: userId,
    status: "accepted",
  }).select("users");
  const me = userId.toString();
  return links
    .flatMap((l) => l.users.map(String))
    .filter((id) => id !== me);
};

const chatSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Unauthorized"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) return next(new Error("Unauthorized"));

      socket.user = user;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    const uid = socket.user._id.toString();
    console.log("🟢 Socket connected:", uid);

    // --- Online presence (synchronous bookkeeping) ---
    socket.join(`user:${uid}`); // personal room for targeted presence events
    const becameOnline = presence.addSocket(uid, socket.id);
    const sharePresence = socket.user.privacySettings?.showOnlineStatus !== false;

    // IMPORTANT: register every client-event handler SYNCHRONOUSLY here, before
    // any `await`. Socket.IO does not buffer events for handlers that aren't
    // attached yet, so if we awaited DB work first (as this used to), a client
    // that emits `join_conversation` immediately after connecting would have it
    // silently dropped — and then never receive messages for that conversation.
    // The async presence announce runs *after* these registrations (see below).

    socket.on("join_conversation", async (conversationId) => {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      const isParticipant = conversation.participants.some(
        (id) => id.toString() === socket.user._id.toString()
      );

      if (
        !isParticipant ||
        conversation.university.toString() !== socket.user.university.toString()
      ) {
        return;
      }

      socket.join(conversationId);
    });

    socket.on("send_message", async ({ conversationId, content }) => {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      const isParticipant = conversation.participants.some(
        (id) => id.toString() === socket.user._id.toString()
      );

      if (
        !isParticipant ||
        conversation.university.toString() !== socket.user.university.toString()
      ) {
        return;
      }

      const message = await Message.create({
        conversation: conversationId,
        sender: socket.user._id,
        university: socket.user.university,
        content,
      });

      conversation.lastMessage = content;
      conversation.lastMessageAt = new Date();
      await conversation.save();

      io.to(conversationId).emit("receive_message", message);

      // Notify the other participant(s) — coalesce into one unread per conversation.
      try {
        const recipients = conversation.participants
          .map((p) => p.toString())
          .filter((pid) => pid !== socket.user._id.toString());
        const snippet = content.length > 80 ? `${content.slice(0, 77)}…` : content;
        await Promise.all(
          recipients.map((rid) =>
            Notification.findOneAndUpdate(
              { user: rid, type: "message", relatedId: conversationId, read: false },
              {
                user: rid,
                type: "message",
                title: `New message from ${socket.user.displayName}`,
                description: snippet,
                relatedId: conversationId,
                relatedModel: "Conversation",
                read: false,
              },
              { upsert: true, setDefaultsOnInsert: true }
            )
          )
        );
      } catch (e) {
        console.error("notification (message) failed:", e.message);
      }
    });

    socket.on("mark_read", async ({ conversationId }) => {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      const isParticipant = conversation.participants.some(
        (id) => id.toString() === socket.user._id.toString()
      );

      if (
        !isParticipant ||
        conversation.university.toString() !== socket.user.university.toString()
      ) {
        return;
      }

      await Message.updateMany(
        {
          conversation: conversationId,
          sender: { $ne: socket.user._id },
          readAt: null,
        },
        { readAt: new Date() }
      );

      io.to(conversationId).emit("messages_read", {
        conversationId,
        readerId: socket.user._id,
      });
    });

    socket.on("disconnect", async () => {
      console.log("🔴 Socket disconnected:", uid);
      const becameOffline = presence.removeSocket(uid, socket.id);
      if (becameOffline && sharePresence) {
        try {
          const friendIds = await friendIdsOf(socket.user._id);
          friendIds.forEach((fid) =>
            io.to(`user:${fid}`).emit("friend_offline", { userId: uid })
          );
        } catch (e) {
          console.error("presence (disconnect) failed:", e.message);
        }
      }
    });

    // --- Presence announce (async; runs only after the handlers above are
    // attached, so it can never delay/drop a client's early join_conversation). ---
    try {
      const friendIds = await friendIdsOf(socket.user._id);

      // Tell me which of my friends are currently online (respecting their
      // own showOnlineStatus — offline-by-choice friends are simply omitted).
      const visibleOnline = [];
      for (const fid of presence.onlineAmong(friendIds)) {
        // eslint-disable-next-line no-await-in-loop
        const f = await User.findById(fid).select("privacySettings");
        if (f?.privacySettings?.showOnlineStatus !== false) visibleOnline.push(fid);
      }
      socket.emit("presence_snapshot", { online: visibleOnline });

      // Announce me to my friends (only on my first socket, and if I allow it).
      if (becameOnline && sharePresence) {
        friendIds.forEach((fid) =>
          io.to(`user:${fid}`).emit("friend_online", { userId: uid })
        );
      }
    } catch (e) {
      console.error("presence (connect) failed:", e.message);
    }
  });
};

module.exports = chatSocket;
