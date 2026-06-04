/**
 * Seed script — populates the marketplace, study groups, and the primary
 * user's private conversations with realistic MANIT-themed demo data.
 *
 * Usage:  cd backend && npm run seed
 * Env:    SEED_PRIMARY_EMAIL chooses whose Messages get the demo chats
 *         (defaults to the project owner's account).
 * Reads MONGO_URI from backend/.env. Safe to re-run: it resets only the demo
 * data it owns (demo users' listings/groups + the primary user's seeded
 * threads), never real users or their real data.
 */
require("dotenv").config();
const mongoose = require("mongoose");

const University = require("../src/models/University");
const User = require("../src/models/User");
const Listing = require("../src/models/Listing");
const StudyGroup = require("../src/models/StudyGroup");
const Conversation = require("../src/models/Conversation");
const Message = require("../src/models/Message");
const Notification = require("../src/models/Notification");

const STUDENT_DOMAIN = "stu.manit.ac.in";
const DEMO_PASSWORD = "password123";

const demoUsers = [
  { displayName: "Aarav Mehta", email: "aarav.demo@stu.manit.ac.in" },
  { displayName: "Diya Sharma", email: "diya.demo@stu.manit.ac.in" },
  { displayName: "Rohan Verma", email: "rohan.demo@stu.manit.ac.in" },
  { displayName: "Ananya Iyer", email: "ananya.demo@stu.manit.ac.in" },
];

const inDays = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("✗ MONGO_URI is not set. Add it to backend/.env first.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✓ Connected to MongoDB");

  // 1) University — reuse the one real students belong to (by email domain)
  //    so seeded data is in-scope for everyone on @stu.manit.ac.in.
  let university = await University.findOne({ domains: STUDENT_DOMAIN });
  if (!university) {
    university = await University.create({
      name: "Maulana Azad National Institute of Technology",
      domains: [STUDENT_DOMAIN],
      isVerified: true,
    });
    console.log(`✓ Created university "${university.name}"`);
  } else {
    console.log(`✓ Using existing university "${university.name}"`);
  }

  // 2) Demo users (create if missing — password is hashed by the model hook)
  const users = {};
  for (const u of demoUsers) {
    let user = await User.findOne({ email: u.email });
    if (!user) {
      user = await User.create({
        ...u,
        password: DEMO_PASSWORD,
        university: university._id,
        location: "MANIT, Bhopal",
        bio: "Demo student account for Manit Hub.",
      });
      console.log(`  + user ${u.email}`);
    }
    users[u.email] = user;
  }
  const id = (key) => users[`${key}.demo@stu.manit.ac.in`]._id;
  const demoUserIds = Object.values(users).map((u) => u._id);

  // 3) Reset previously-seeded data (idempotent — only demo-owned docs)
  const delL = await Listing.deleteMany({ seller: { $in: demoUserIds } });
  const delG = await StudyGroup.deleteMany({ creator: { $in: demoUserIds } });
  console.log(`✓ Cleared ${delL.deletedCount} old listings, ${delG.deletedCount} old groups`);

  // 4) Marketplace listings
  const listings = [
    { title: "GATE 2026 CSE — Made Easy Full Set", description: "Complete Made Easy theory + practice book set for GATE CSE. Barely used, no markings.", price: 1800, category: "Textbooks", condition: "like-new", seller: id("aarav") },
    { title: "Introduction to Algorithms (CLRS, 3rd Ed.)", description: "The classic CLRS. Some highlighting in early chapters.", price: 450, category: "Textbooks", condition: "good", seller: id("diya") },
    { title: "Casio FX-991EX Scientific Calculator", description: "Allowed in exams. Works perfectly, includes cover.", price: 750, category: "Electronics", condition: "like-new", seller: id("rohan") },
    { title: "Symphony 27L Hostel Air Cooler", description: "Survived two Bhopal summers. Cools great, selling as I graduate.", price: 2200, category: "Electronics", condition: "good", seller: id("ananya") },
    { title: "Mini Drafter (Engineering Drawing)", description: "First-year Engineering Drawing drafter. All clamps intact.", price: 250, category: "Other", condition: "good", seller: id("aarav") },
    { title: "Hercules Roadeo 26T Cycle", description: "Gear cycle, perfect for getting around campus. New brakes.", price: 3500, category: "Sports", condition: "good", seller: id("diya") },
    { title: "Wooden Study Table + Chair", description: "Sturdy study table with chair. Pickup from H-9.", price: 1500, category: "Furniture", condition: "good", status: "reserved", seller: id("rohan") },
    { title: "White Lab Coat (Size M)", description: "Chemistry/workshop lab coat, washed and clean.", price: 180, category: "Clothing", condition: "like-new", seller: id("ananya") },
    { title: 'HP 22" Full-HD Monitor', description: "1080p IPS monitor, great for coding/projects. HDMI + VGA.", price: 5500, category: "Electronics", condition: "good", seller: id("aarav") },
    { title: "Mechanical Keyboard + Wireless Mouse Combo", description: "Blue switches + Logitech mouse. Loved during placements prep.", price: 1200, category: "Electronics", condition: "like-new", status: "sold", seller: id("diya") },
    { title: "Engineering Physics + Maths Reference Bundle", description: "First-year PHY + M-I/M-II reference books. Some wear.", price: 600, category: "Textbooks", condition: "fair", seller: id("rohan") },
    { title: "Yonex Badminton Racket + Shuttles", description: "Lightweight racket with a tube of shuttles. Sports complex ready.", price: 900, category: "Sports", condition: "good", seller: id("ananya") },
  ].map((l) => ({ ...l, university: university._id, images: [] }));

  await Listing.insertMany(listings);
  console.log(`✓ Inserted ${listings.length} listings`);

  // 5) Study groups (use .create so the creator is auto-added to members)
  const groups = [
    {
      name: "DSA & CP Grind (Weekly)", subject: "Computer Science",
      description: "Weekly LeetCode + Codeforces solving sessions. All levels welcome.",
      tags: ["algorithms", "leetcode", "cp"], maxMembers: 15,
      creator: id("aarav"), members: [id("aarav"), id("rohan"), id("diya")],
      links: { whatsapp: "https://chat.whatsapp.com/manit-dsa-grind" },
      nextSession: { at: inDays(2), mode: "online", location: "Online", meetingLink: "https://meet.google.com/dsa-grind" },
    },
    {
      name: "GATE CSE 2026 Prep", subject: "Computer Science",
      description: "Subject-wise theory + weekly mock tests for GATE CSE 2026.",
      tags: ["gate", "theory", "mock-tests"], maxMembers: 25,
      creator: id("diya"), members: [id("diya"), id("ananya")],
      links: { telegram: "https://t.me/manit-gate-cse" },
      nextSession: { at: inDays(3), mode: "offline", location: "Central Library, 2nd Floor" },
    },
    {
      name: "DBMS + OS Revision", subject: "Computer Science",
      description: "Pre-exam revision for DBMS and Operating Systems. SQL practice included.",
      tags: ["dbms", "os", "sql"], maxMembers: 12,
      creator: id("rohan"), members: [id("rohan"), id("aarav")],
    },
    {
      name: "Engineering Mathematics Doubt-Solving", subject: "Mathematics",
      description: "Bring your M-I / M-II doubts. Calculus, linear algebra, probability.",
      tags: ["calculus", "linear-algebra", "probability"], maxMembers: 20,
      creator: id("ananya"), members: [id("ananya"), id("diya")],
      nextSession: { at: inDays(1), mode: "offline", location: "NTB, Room 204" },
    },
    {
      name: "Web Dev Project Club (MERN)", subject: "Engineering",
      description: "Build full-stack projects together — React, Node, Express, MongoDB.",
      tags: ["react", "node", "mongodb", "projects"], maxMembers: 18,
      creator: id("aarav"), members: [id("aarav"), id("rohan"), id("ananya")],
      links: { discord: "https://discord.gg/manit-webdev" },
      customLinks: [{ label: "GitHub", url: "https://github.com/manit-webdev-club" }],
      nextSession: { at: inDays(5), mode: "online", location: "Online", meetingLink: "https://meet.google.com/manit-mern" },
    },
    {
      name: "Physics for First-Years", subject: "Physics",
      description: "Semester-1 mechanics and modern physics. Peer teaching welcome.",
      tags: ["mechanics", "semester-1"], maxMembers: 30,
      creator: id("diya"), members: [id("diya")],
    },
    {
      name: "Aptitude & Placement Prep", subject: "Other",
      description: "Quant, logical reasoning and interview prep for placements & internships.",
      tags: ["aptitude", "placements", "interviews"], maxMembers: 40,
      creator: id("rohan"), members: [id("rohan"), id("aarav"), id("diya"), id("ananya")],
      links: { whatsapp: "https://chat.whatsapp.com/manit-placements" },
      nextSession: { at: inDays(4), mode: "offline", location: "Seminar Hall, NTB" },
    },
  ].map((g) => ({ ...g, university: university._id }));

  for (const g of groups) {
    await StudyGroup.create(g);
  }
  console.log(`✓ Inserted ${groups.length} study groups`);

  // 6) Conversations + messages — ONLY for the primary user (you).
  //    Conversations are scoped to their two participants, so these threads are
  //    private to the primary user and the seller — never visible to everyone.
  //    Messages are written straight to the DB (the app reads them over REST).
  const primaryEmail = process.env.SEED_PRIMARY_EMAIL || "2311401212@stu.manit.ac.in";
  const primary = await User.findOne({ email: primaryEmail });

  if (!primary) {
    console.log(`! Skipping conversations — primary user ${primaryEmail} not found.`);
  } else if (String(primary.university) !== String(university._id)) {
    console.log(`! Skipping conversations — ${primaryEmail} is in a different university.`);
  } else {
    // reset any prior seeded threads (primary <-> a demo seller) + their messages
    const priorConvos = await Conversation.find({ participants: primary._id });
    const seededIds = priorConvos
      .filter((c) => c.participants.map(String).some((p) => demoUserIds.map(String).includes(p)))
      .map((c) => c._id);
    await Message.deleteMany({ conversation: { $in: seededIds } });
    await Conversation.deleteMany({ _id: { $in: seededIds } });

    // [sender, content, "unread"?] — "me" = primary user, "seller" = the other party
    const convoSpecs = [
      { sellerKey: "aarav", title: 'HP 22" Full-HD Monitor', thread: [
        ["me", "Hi! Is the HP monitor still available?"],
        ["seller", "Yes, it is! Barely used, works perfectly."],
        ["me", "Great. Would you take ₹5000?"],
        ["seller", "Can do ₹5200 and I'll throw in the HDMI cable.", "unread"],
      ]},
      { sellerKey: "rohan", title: "Casio FX-991EX Scientific Calculator", thread: [
        ["me", "Is the Casio calculator still up for sale?"],
        ["seller", "Yep, ₹750 — comes with the cover."],
        ["me", "Perfect, can I pick it up from your hostel this evening?"],
      ]},
      { sellerKey: "diya", title: "Hercules Roadeo 26T Cycle", thread: [
        ["me", "Interested in the cycle. How are the tyres and brakes?"],
        ["seller", "Both tyres are fine and the brakes are new — rides smooth."],
        ["seller", "I can show you near H-7 whenever you're free.", "unread"],
      ]},
      { sellerKey: "ananya", title: "Yonex Badminton Racket + Shuttles", thread: [
        ["me", "Hey, is the Yonex racket still available?"],
        ["seller", "Hi! Yes it is, and it comes with a tube of shuttles.", "unread"],
      ]},
    ];

    let convCount = 0;
    let msgCount = 0;
    for (const spec of convoSpecs) {
      const seller = users[`${spec.sellerKey}.demo@stu.manit.ac.in`];
      const listing = await Listing.findOne({ title: spec.title, seller: seller._id });
      if (!listing) {
        console.log(`  ! listing not found for conversation: ${spec.title}`);
        continue;
      }

      const participants = [String(primary._id), String(seller._id)].sort();
      const conversation = await Conversation.create({
        listingId: listing._id,
        listingTitle: listing.title,
        participants,
        university: university._id,
      });

      const start = Date.now() - 2 * 24 * 60 * 60 * 1000; // ~2 days ago
      const docs = spec.thread.map((m, i) => {
        const when = new Date(start + i * 11 * 60 * 1000); // ~11 min apart
        return {
          conversation: conversation._id,
          sender: m[0] === "me" ? primary._id : seller._id,
          university: university._id,
          content: m[1],
          readAt: m[2] === "unread" ? null : new Date(when.getTime() + 60 * 1000),
          createdAt: when,
          updatedAt: when,
        };
      });
      await Message.insertMany(docs, { timestamps: false });

      const last = docs[docs.length - 1];
      conversation.lastMessage = last.content;
      conversation.lastMessageAt = last.createdAt;
      await conversation.save();

      convCount += 1;
      msgCount += docs.length;
    }
    console.log(`✓ Seeded ${convCount} conversations (${msgCount} messages) for ${primaryEmail}`);
  }

  // 7) Notifications — ONLY for the primary user (private to their account).
  if (primary) {
    const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000);
    const notifs = [
      { type: "system", title: "Welcome to Manit Hub 🎓", description: "Your campus hub for NIT Bhopal is ready — explore the marketplace, study groups and campus maps.", read: true, createdAt: hoursAgo(96) },
      { type: "marketplace", title: "New in Textbooks", description: "“GATE 2026 CSE — Made Easy Full Set” was just listed for ₹1,800.", read: true, createdAt: hoursAgo(54) },
      { type: "study-group", title: "New study group: DSA & CP Grind", description: "A Computer Science group is now open to join.", read: true, createdAt: hoursAgo(50) },
      { type: "marketplace", title: "On your radar", description: "Casio FX-991EX Scientific Calculator is available for ₹750.", read: true, createdAt: hoursAgo(30) },
      { type: "study-group", title: "Session reminder: GATE CSE 2026 Prep", description: "Next meetup at Central Library, 2nd Floor in 2 days.", read: false, createdAt: hoursAgo(8) },
      { type: "message", title: "New message from Diya Sharma", description: "“I can show you near H-7 whenever you're free.” — Hercules Roadeo 26T Cycle", read: false, createdAt: hoursAgo(5) },
      { type: "system", title: "Complete your profile", description: "Add a photo and a short bio so other students recognise you.", read: false, createdAt: hoursAgo(3) },
      { type: "message", title: "New message from Aarav Mehta", description: '“Can do ₹5,200 and I\'ll throw in the HDMI cable.” — HP 22" Full-HD Monitor', read: false, createdAt: hoursAgo(1) },
    ].map((n) => ({ ...n, user: primary._id, updatedAt: n.createdAt }));

    const titles = notifs.map((n) => n.title);
    const delN = await Notification.deleteMany({ user: primary._id, title: { $in: titles } });
    await Notification.insertMany(notifs, { timestamps: false });
    const unread = notifs.filter((n) => !n.read).length;
    console.log(`✓ Seeded ${notifs.length} notifications (${unread} unread, reset ${delN.deletedCount}) for ${primaryEmail}`);
  }

  await mongoose.disconnect();
  console.log("\n✓ Seed complete. Demo logins: <name>.demo@stu.manit.ac.in / password123");
}

run().catch(async (err) => {
  console.error("✗ Seed failed:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
