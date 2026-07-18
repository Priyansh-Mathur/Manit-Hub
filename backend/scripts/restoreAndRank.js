/**
 * One-off: restore Samay's academics + the real Samay↔Shanjhi conversation,
 * fully restore Shanjhi's own content from backup, and set a points leaderboard
 * (Shanjhi #1 @1200, Samay @1000, tiered others). Reads backups from
 * backend/backups/. Safe to re-run.
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const University = require("../models/University");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Friendship = require("../models/Friendship");

const OWNER = {
  Listing: "seller", Offer: "buyer", Document: "uploader", Confession: "author",
  Question: "author", Answer: "author", Ride: "poster", Event: "organizer",
  LostFoundItem: "reporter", StudyGroup: "creator", Notification: "user",
  AcademicRecord: "user", AttendanceSubject: "user", TimetableEntry: "user", DeviceToken: "user",
};
const modelOf = (k) => require("../models/" + k);

const SAMAY = "2311401212@stu.manit.ac.in";
const SHANJHI = "2311401213@stu.manit.ac.in";
const badgesFor = (p) => { const b = []; if (p >= 100) b.push("Rising Star"); if (p >= 500) b.push("Campus Hero"); if (p >= 1000) b.push("MANIT Legend"); return b; };

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✓ Connected");
  const uni = await University.findOne({ domains: "stu.manit.ac.in" });
  const samay = await User.findOne({ email: SAMAY });
  const shanjhi = await User.findOne({ email: SHANJHI });
  if (!samay || !shanjhi) throw new Error("Protected accounts missing");
  const sid = samay._id, hid = shanjhi._id;

  const bkS = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "backups", "2311401212.json"), "utf8"));
  const bkH = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "backups", "2311401213.json"), "utf8"));

  // ── 1) Samay academics: restore CGPA + timetable + attendance ──────────────
  for (const key of ["AcademicRecord", "TimetableEntry", "AttendanceSubject"]) {
    const Model = modelOf(key);
    await Model.deleteMany({ user: sid });
    const docs = bkS.related[key] || [];
    if (docs.length) await Model.insertMany(docs, { timestamps: false });
    console.log(`✓ Samay ${key}: restored ${docs.length}`);
  }

  // ── 2) Samay↔Shanjhi conversation + messages ───────────────────────────────
  const sConv = new Set((bkS.related.Message || []).map((m) => String(m.conversation)));
  const hConv = new Set((bkH.related.Message || []).map((m) => String(m.conversation)));
  const sharedConvId = [...sConv].find((c) => hConv.has(c));
  if (sharedConvId) {
    const msgs = [...(bkS.related.Message || []), ...(bkH.related.Message || [])]
      .filter((m) => String(m.conversation) === sharedConvId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const participants = [String(sid), String(hid)].sort();
    // Clear any seeded convos involving Shanjhi (so her chat list is just the real one)
    const hConvos = await Conversation.find({ participants: hid }, "_id").lean();
    await Message.deleteMany({ conversation: { $in: hConvos.map((c) => c._id) } });
    await Conversation.deleteMany({ _id: { $in: hConvos.map((c) => c._id) } });
    await Message.deleteMany({ conversation: sharedConvId });
    await Conversation.deleteOne({ _id: sharedConvId });
    const last = msgs[msgs.length - 1];
    await Conversation.collection.insertOne({
      _id: new mongoose.Types.ObjectId(sharedConvId), listingId: null, contextType: "friend",
      listingTitle: "", participants: participants.map((p) => new mongoose.Types.ObjectId(p)),
      university: uni._id, lastMessage: last.content, lastMessageAt: new Date(last.createdAt),
      createdAt: new Date(msgs[0].createdAt), updatedAt: new Date(last.createdAt),
    });
    await Message.insertMany(msgs, { timestamps: false });
    console.log(`✓ Restored Samay↔Shanjhi conversation (${msgs.length} messages)`);
  } else {
    console.log("! No shared Samay↔Shanjhi conversation found in backups");
  }

  // ── 3) Full restore Shanjhi's own content ──────────────────────────────────
  for (const [key, docs] of Object.entries(bkH.related)) {
    if (key === "Friendship" || key === "Message") continue; // handled separately
    const field = OWNER[key];
    if (!field) continue;
    const Model = modelOf(key);
    await Model.deleteMany({ [field]: hid });
    if (docs.length) await Model.insertMany(docs, { timestamps: false });
    console.log(`✓ Shanjhi ${key}: restored ${docs.length}`);
  }

  // Shanjhi friendships: restore those whose counterpart still exists; then make
  // sure Samay↔Shanjhi are friends.
  await Friendship.deleteMany({ users: hid });
  const validFr = [];
  for (const d of bkH.related.Friendship || []) {
    const others = (d.users || []).map(String).filter((x) => x !== String(hid));
    if (others.length && (await User.exists({ _id: { $in: others } }))) validFr.push(d);
  }
  if (validFr.length) await Friendship.insertMany(validFr, { timestamps: false });
  const pk = [String(sid), String(hid)].sort().join("_");
  await Friendship.updateOne(
    { pairKey: pk },
    { $setOnInsert: { requester: sid, recipient: hid, users: [String(sid), String(hid)].sort(), pairKey: pk, status: "accepted", university: uni._id } },
    { upsert: true }
  );
  console.log(`✓ Shanjhi friendships: restored ${validFr.length} valid + ensured Samay↔Shanjhi`);

  // ── 4) Points leaderboard ──────────────────────────────────────────────────
  const others = await User.find({ email: { $nin: [SAMAY, SHANJHI] }, isBanned: { $ne: true } }, "_id").lean();
  // deterministic shuffle
  let s = 12345; const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let i = others.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [others[i], others[j]] = [others[j], others[i]]; }
  const tiers = [[800, 3], [700, 4], [600, 5], [500, 6], [400, 8], [300, 10], [250, 12], [180, 15]];
  const ops = [];
  let idx = 0;
  for (const [pts, cnt] of tiers) {
    for (let i = 0; i < cnt && idx < others.length; i++, idx++) {
      ops.push({ updateOne: { filter: { _id: others[idx]._id }, update: { $set: { points: pts }, $addToSet: { badges: { $each: badgesFor(pts) } } } } });
    }
  }
  ops.push({ updateOne: { filter: { _id: hid }, update: { $set: { points: 1200 }, $addToSet: { badges: { $each: badgesFor(1200) } } } } });
  ops.push({ updateOne: { filter: { _id: sid }, update: { $set: { points: 1000 }, $addToSet: { badges: { $each: badgesFor(1000) } } } } });
  await User.bulkWrite(ops);
  console.log(`✓ Points set: Shanjhi 1200, Samay 1000, ${ops.length - 2} tiered users`);

  // ── verify leaderboard top 10 ──────────────────────────────────────────────
  const top = await User.find({}, "displayName points email").sort({ points: -1 }).limit(10).lean();
  console.log("\nLeaderboard top 10:");
  top.forEach((u, i) => console.log(`  ${i + 1}. ${u.displayName.padEnd(18)} ${u.points} pts  (${u.email.split("@")[0]})`));

  await mongoose.disconnect();
  console.log("\n✓ Done.");
})().catch(async (e) => { console.error("✗ Failed:", e); await mongoose.disconnect().catch(() => {}); process.exit(1); });
