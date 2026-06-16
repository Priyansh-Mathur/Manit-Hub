import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "https://manithub-backend.vercel.app";

class SocketService {
  constructor() {
    this.socket = null;
    // Conversation rooms the user currently has open. The set is re-joined on
    // every (re)connect so messages keep arriving after a network blip or a
    // server restart (see connect()).
    this.joinedConversations = new Set();
  }

  connect() {
    // Idempotent: reuse the live socket so app-wide presence and the Messages
    // page share one connection.
    if (this.socket && this.socket.connected) return this.socket;
    if (this.socket) return this.socket;
    this.socket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token')
      }
    });
    // socket.io emits 'connect' on the FIRST connection and on EVERY
    // reconnection. Each (re)connection is a fresh server-side socket that has
    // joined no conversation rooms, so we must re-join every open room here —
    // otherwise incoming messages silently stop after a reconnect until the
    // conversation is re-selected.
    this.socket.on('connect', () => {
      this.joinedConversations.forEach((id) =>
        this.socket.emit('join_conversation', id)
      );
    });
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.joinedConversations.clear();
  }

  joinConversation(conversationId) {
    if (!conversationId) return;
    this.joinedConversations.add(conversationId);
    if (this.socket) {
      this.socket.emit('join_conversation', conversationId);
    }
  }

  leaveConversation(conversationId) {
    // Stop re-joining a room we no longer have open (so a reconnect doesn't
    // pull stale rooms back in). We don't emit a server-side leave — the
    // server has no leave handler and drops the room on disconnect anyway.
    if (conversationId) this.joinedConversations.delete(conversationId);
  }

  isConnected() {
    return !!(this.socket && this.socket.connected);
  }

  sendMessage(data) {
    if (this.socket) {
      this.socket.emit('send_message', data);
    }
  }

  markRead(conversationId) {
    if (this.socket) {
      this.socket.emit('mark_read', { conversationId });
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receive_message', callback);
    }
  }

  offReceiveMessage() {
    if (this.socket) {
      this.socket.off('receive_message');
    }
  }

  onMessagesRead(callback) {
    if (this.socket) {
      this.socket.on('messages_read', callback);
    }
  }

  offMessagesRead() {
    if (this.socket) {
      this.socket.off('messages_read');
    }
  }

  // --- Friend presence ---
  onPresenceSnapshot(callback) {
    if (this.socket) this.socket.on('presence_snapshot', callback);
  }

  onFriendOnline(callback) {
    if (this.socket) this.socket.on('friend_online', callback);
  }

  onFriendOffline(callback) {
    if (this.socket) this.socket.on('friend_offline', callback);
  }

  offPresence() {
    if (this.socket) {
      this.socket.off('presence_snapshot');
      this.socket.off('friend_online');
      this.socket.off('friend_offline');
    }
  }
}

export default new SocketService();
