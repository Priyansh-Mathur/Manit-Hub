/**
 * Seed script — populates the marketplace, lost & found, study groups, the
 * friend graph and the primary user's conversations with realistic
 * MANIT-themed demo data, spread across the last 30 days.
 *
 * Usage:  cd backend && npm run seed
 * Env:    SEED_PRIMARY_EMAIL chooses whose Messages/notifications/friendships
 *         get the demo content (defaults to the project owner's account).
 * Reads MONGO_URI from backend/.env. Safe to re-run: it resets only the demo
 * data it owns (seed users' listings/groups/lost-&-found/friendships + the
 * seed-only conversations), never real users or their real data.
 */
require("dotenv").config();
const mongoose = require("mongoose");

const University = require("../src/models/University");
const User = require("../src/models/User");
const Listing = require("../src/models/Listing");
const StudyGroup = require("../src/models/StudyGroup");
const LostFoundItem = require("../src/models/LostFoundItem");
const Friendship = require("../src/models/Friendship");
const Conversation = require("../src/models/Conversation");
const Message = require("../src/models/Message");
const Notification = require("../src/models/Notification");

const STUDENT_DOMAIN = "stu.manit.ac.in";
const DEMO_PASSWORD = "password123";
const SEED_WINDOW_DAYS = 30;

// ── Time helpers — everything is spread across the last 30 days ──────────────
const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();
const daysAgo = (d) => new Date(now - d * DAY);
const inDays = (n) => new Date(now + n * DAY);

// ── Image library — verified, topical, publicly-hosted photos ───────────────
// Cloudinary is the real upload path; for seed data we point `images[]` at
// stable public URLs so cards render real photos in the marketplace / L&F UI.
const U = (id) => `https://images.unsplash.com/photo-${id}?w=600&q=80`;
const IMG = {
  books: U("1544716278-ca5e3f4abd8c"),
  openBook: U("1532012197267-da84d127e765"),
  laptop: U("1517336714731-489689fd1ca8"),
  monitor: U("1527443224154-c4a3942d3acf"),
  keyboard: U("1587829741301-dc798b83add3"),
  headphones: U("1505740420928-5e560c06d30e"),
  bicycle: U("1485965120184-e220f721d03e"),
  phone: U("1511707171634-5f897ff02aa9"),
  guitar: U("1510915361894-db8b60106cb1"),
  sneakers: U("1542291026-7eec264c27ff"),
  camera: U("1502920917128-1aa500764cbd"),
  watch: U("1524805444758-089113d48a6d"),
  backpack: U("1553062407-98eeb64c6a62"),
  mug: U("1514228742587-6b1558fcca3d"),
  sunglasses: U("1572635196237-14b3f281503f"),
  notebook: U("1531346878377-a5be20888e57"),
  chair: U("1505843513577-22bb7d21e455"),
  fan: U("1565374395542-0ce18882c857"),
  labcoat: U("1581595220892-b0739db3ba8c"),
  racket: U("1626224583764-f87db24ac4ea"),
  umbrella: U("1534551767192-78b8dd45b51b"),
  keys: U("1582550945154-66ea8fff25e1"),
  wallet: U("1627123424574-724758594e93"),
  earbuds: U("1606220588913-b3aacb4d2f46"),
  lamp: U("1507473885765-e6ed057f782c"),
  bottle: U("1602143407151-7111542de6e8"),
  calculator: U("1564466809058-bf4114d55352"),
  tshirt: U("1521572163474-6864f9cf17ab"),
  fridge: U("1571175443880-49e1d25b2bc5"),
  cricketBat: U("1531415074968-036ba1b575da"),
  charger: U("1583863788434-e58a36330cf0"),
  idCard: U("1606166187734-a4cb74079037"),
  glasses: U("1574258495973-f010dfbb5371"),
  table: U("1611269154421-4e27233ac5c7"),
  cooler: U("1558618666-fcd25c85cd64"),
};
const pravatar = (n) => `https://i.pravatar.cc/200?img=${n}`;

// ── Seed users ──────────────────────────────────────────────────────────────
// `key` is the short handle used to reference a user below. The first 4 are the
// long-standing demo accounts; the rest are the ~20 new students. `ready: true`
// marks the 5 accounts surfaced as ready-to-use logins at the end.
const userDefs = [
  // existing demo accounts (kept so older seeded references stay valid)
  { key: "aarav", displayName: "Aarav Mehta", email: "aarav.demo@stu.manit.ac.in", handle: "aarav_mehta", avatar: 11, points: 120, badges: ["Top Seller"], bio: "Final-year CSE. Selling stuff before I graduate.", location: "Hostel H-9, MANIT" },
  { key: "diya", displayName: "Diya Sharma", email: "diya.demo@stu.manit.ac.in", handle: "diya_sharma", avatar: 5, points: 95, badges: ["Verified Student"], bio: "ECE '26. GATE aspirant, coffee addict.", location: "Hostel H-10, MANIT" },
  { key: "rohan", displayName: "Rohan Verma", email: "rohan.demo@stu.manit.ac.in", handle: "rohan_verma", avatar: 13, points: 80, badges: [], bio: "Mechanical engg. Cycling + chess.", location: "Hostel H-7, MANIT" },
  { key: "ananya", displayName: "Ananya Iyer", email: "ananya.demo@stu.manit.ac.in", handle: "ananya_iyer", avatar: 9, points: 110, badges: ["Helpful"], bio: "Maths nerd, badminton on weekends.", location: "Hostel H-12, MANIT" },

  // 5 ready-to-use logins (rich profiles + data)
  { key: "priya", displayName: "Priya Nair", email: "priya.demo@stu.manit.ac.in", handle: "priya_nair", avatar: 47, points: 140, badges: ["Top Seller", "Verified Student"], bio: "CSE '25. Loves audio gear and clean code.", location: "Hostel H-12, MANIT", ready: true },
  { key: "arjun", displayName: "Arjun Reddy", email: "arjun.demo@stu.manit.ac.in", handle: "arjun.reddy", avatar: 12, points: 130, badges: ["Verified Student"], bio: "Placement grind mode. DSA every day.", location: "Hostel H-8, MANIT", ready: true },
  { key: "sneha", displayName: "Sneha Gupta", email: "sneha.demo@stu.manit.ac.in", handle: "sneha_g", avatar: 45, points: 105, badges: ["Helpful"], bio: "EEE '26. Photography + chai breaks.", location: "Hostel H-11, MANIT", ready: true },
  { key: "karan", displayName: "Karan Singh", email: "karan.demo@stu.manit.ac.in", handle: "karan_singh", avatar: 33, points: 90, badges: [], bio: "Guitar, OS assignments and football.", location: "Hostel H-7, MANIT", ready: true },
  { key: "isha", displayName: "Isha Patel", email: "isha.demo@stu.manit.ac.in", handle: "isha.patel", avatar: 44, points: 100, badges: ["Verified Student"], bio: "Runner. Civil engg. Always at the sports complex.", location: "Hostel H-10, MANIT", ready: true },

  // the rest of the ~20 new students
  { key: "vikram", displayName: "Vikram Rao", email: "vikram.demo@stu.manit.ac.in", handle: "vikram_rao", avatar: 51, points: 70, badges: [], bio: "Photography club. Shoots campus events.", location: "Hostel H-8, MANIT" },
  { key: "neha", displayName: "Neha Joshi", email: "neha.demo@stu.manit.ac.in", handle: "neha_joshi", avatar: 32, points: 65, badges: [], bio: "Soft-skills circle organiser. Loves debates.", location: "Hostel H-11, MANIT" },
  { key: "aditya", displayName: "Aditya Kumar", email: "aditya.demo@stu.manit.ac.in", handle: "aditya_k", avatar: 53, points: 60, badges: [], bio: "Gym + gadgets. IT branch.", location: "Hostel H-5, MANIT" },
  { key: "riya", displayName: "Riya Desai", email: "riya.demo@stu.manit.ac.in", handle: "riya_desai", avatar: 26, points: 85, badges: ["Helpful"], bio: "Night-owl studier. Sells study gear.", location: "Hostel H-12, MANIT" },
  { key: "sid", displayName: "Siddharth Menon", email: "sid.demo@stu.manit.ac.in", handle: "sid_menon", avatar: 60, points: 55, badges: [], bio: "Maths doubt-solver. Keeps finding lost notebooks.", location: "Hostel H-9, MANIT" },
  { key: "tanvi", displayName: "Tanvi Shah", email: "tanvi.demo@stu.manit.ac.in", handle: "tanvi_shah", avatar: 25, points: 75, badges: [], bio: "Cricketer. Captain of the hostel team.", location: "Hostel H-11, MANIT" },
  { key: "harsh", displayName: "Harsh Agarwal", email: "harsh.demo@stu.manit.ac.in", handle: "harsh_a", avatar: 56, points: 50, badges: [], bio: "Hostel fridge dealer. Always trading.", location: "Hostel H-6, MANIT" },
  { key: "pooja", displayName: "Pooja Bhatt", email: "pooja.demo@stu.manit.ac.in", handle: "pooja_bhatt", avatar: 31, points: 88, badges: ["Verified Student"], bio: "Aptitude prep + sketching.", location: "Hostel H-10, MANIT" },
  { key: "rahul", displayName: "Rahul Khanna", email: "rahul.demo@stu.manit.ac.in", handle: "rahul_khanna", avatar: 58, points: 45, badges: [], bio: "Fresher. Selling spare clothes and gear.", location: "Hostel H-4, MANIT" },
  { key: "meera", displayName: "Meera Pillai", email: "meera.demo@stu.manit.ac.in", handle: "meera_pillai", avatar: 27, points: 92, badges: ["Helpful"], bio: "Hydration evangelist. Chem engg.", location: "Hostel H-12, MANIT" },
  { key: "nikhil", displayName: "Nikhil Saxena", email: "nikhil.demo@stu.manit.ac.in", handle: "nikhil_s", avatar: 59, points: 78, badges: [], bio: "Phone flipper. CSE '25.", location: "Hostel H-8, MANIT" },
  { key: "ayesha", displayName: "Ayesha Khan", email: "ayesha.demo@stu.manit.ac.in", handle: "ayesha_khan", avatar: 48, points: 82, badges: ["Verified Student"], bio: "English circle lead. Loves mock interviews.", location: "Hostel H-11, MANIT" },
  { key: "dev", displayName: "Dev Malhotra", email: "dev.demo@stu.manit.ac.in", handle: "dev_malhotra", avatar: 61, points: 67, badges: [], bio: "Coffee + cameras + code.", location: "Hostel H-7, MANIT" },
  { key: "kavya", displayName: "Kavya Reddy", email: "kavya.demo@stu.manit.ac.in", handle: "kavya_reddy", avatar: 28, points: 73, badges: [], bio: "Blue-light glasses gang. Designs posters.", location: "Hostel H-10, MANIT" },
  { key: "rohit", displayName: "Rohit Sharma", email: "rohit.demo@stu.manit.ac.in", handle: "rohit_sharma", avatar: 64, points: 58, badges: [], bio: "Furniture & hostel essentials reseller.", location: "Hostel H-3, MANIT" },
];

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

  // 2) Seed users — create if missing (password hashed by the model hook),
  //    otherwise refresh their demo profile fields (never the password).
  const byKey = {};
  let created = 0;
  for (const u of userDefs) {
    let user = await User.findOne({ email: u.email });
    if (!user) {
      user = await User.create({
        email: u.email,
        password: DEMO_PASSWORD,
        displayName: u.displayName,
        handle: u.handle,
        university: university._id,
        location: u.location,
        bio: u.bio,
        avatarUrl: pravatar(u.avatar),
        points: u.points,
        badges: u.badges,
      });
      created += 1;
    } else {
      user.displayName = u.displayName;
      user.handle = u.handle;
      user.location = u.location;
      user.bio = u.bio;
      user.avatarUrl = pravatar(u.avatar);
      user.points = u.points;
      user.badges = u.badges;
      await user.save(); // password not modified → not re-hashed
    }
    byKey[u.key] = user;
  }
  const uid = (k) => byKey[k]._id;
  const seedUserIds = Object.values(byKey).map((u) => u._id);
  console.log(`✓ ${userDefs.length} seed users ready (${created} newly created)`);

  // Primary user (you) — gets the conversations, notifications and a friend graph.
  const primaryEmail = process.env.SEED_PRIMARY_EMAIL || "2311401212@stu.manit.ac.in";
  const primary = await User.findOne({ email: primaryEmail });
  const primaryOk = primary && String(primary.university) === String(university._id);
  if (!primary) {
    console.log(`! Primary user ${primaryEmail} not found — skipping their private demo data.`);
  } else if (!primaryOk) {
    console.log(`! ${primaryEmail} is in a different university — skipping their private demo data.`);
  }

  // 3) Reset previously-seeded data (idempotent — only seed-owned docs)
  const delL = await Listing.deleteMany({ seller: { $in: seedUserIds } });
  const delG = await StudyGroup.deleteMany({ creator: { $in: seedUserIds } });
  const delF = await LostFoundItem.deleteMany({ reporter: { $in: seedUserIds } });
  const delFr = await Friendship.deleteMany({ users: { $in: seedUserIds } });
  console.log(
    `✓ Cleared ${delL.deletedCount} listings, ${delG.deletedCount} groups, ` +
      `${delF.deletedCount} lost&found, ${delFr.deletedCount} friendships`
  );

  // Reset seed-only conversations (every participant is a seed/primary account).
  const convoScope = primaryOk ? [...seedUserIds, primary._id] : [...seedUserIds];
  const scopeSet = new Set(convoScope.map(String));
  const candidateConvos = await Conversation.find({ participants: { $in: convoScope } });
  const seededConvoIds = candidateConvos
    .filter((c) => c.participants.every((p) => scopeSet.has(String(p))))
    .map((c) => c._id);
  await Message.deleteMany({ conversation: { $in: seededConvoIds } });
  await Conversation.deleteMany({ _id: { $in: seededConvoIds } });

  // 4) Marketplace listings — every listing carries a real photo.
  const listingDefs = [
    // demo accounts
    { title: "GATE 2026 CSE — Made Easy Full Set", description: "Complete Made Easy theory + practice book set for GATE CSE. Barely used, no markings.", price: 1800, category: "Textbooks", condition: "like-new", seller: "aarav", img: IMG.books, ageDays: 27 },
    { title: "Introduction to Algorithms (CLRS, 3rd Ed.)", description: "The classic CLRS. Some highlighting in early chapters.", price: 450, category: "Textbooks", condition: "good", seller: "diya", img: IMG.openBook, ageDays: 25 },
    { title: "Casio FX-991EX Scientific Calculator", description: "Allowed in exams. Works perfectly, includes cover.", price: 750, category: "Electronics", condition: "like-new", seller: "rohan", img: IMG.calculator, ageDays: 24 },
    { title: "Symphony 27L Hostel Air Cooler", description: "Survived two Bhopal summers. Cools great, selling as I graduate.", price: 2200, category: "Electronics", condition: "good", seller: "ananya", img: IMG.cooler, ageDays: 22 },
    { title: "Mini Drafter (Engineering Drawing)", description: "First-year Engineering Drawing drafter. All clamps intact.", price: 250, category: "Other", condition: "good", seller: "aarav", img: IMG.notebook, ageDays: 21 },
    { title: "Hercules Roadeo 26T Cycle", description: "Gear cycle, perfect for getting around campus. New brakes.", price: 3500, category: "Sports", condition: "good", seller: "diya", img: IMG.bicycle, ageDays: 20 },
    { title: "Wooden Study Table + Chair", description: "Sturdy study table with chair. Pickup from H-9.", price: 1500, category: "Furniture", condition: "good", status: "reserved", seller: "rohan", img: IMG.table, ageDays: 19 },
    { title: "White Lab Coat (Size M)", description: "Chemistry/workshop lab coat, washed and clean.", price: 180, category: "Clothing", condition: "like-new", seller: "ananya", img: IMG.labcoat, ageDays: 18 },
    { title: 'HP 22" Full-HD Monitor', description: "1080p IPS monitor, great for coding/projects. HDMI + VGA.", price: 5500, category: "Electronics", condition: "good", seller: "aarav", img: IMG.monitor, ageDays: 16 },
    { title: "Mechanical Keyboard + Wireless Mouse Combo", description: "Blue switches + Logitech mouse. Loved during placements prep.", price: 1200, category: "Electronics", condition: "like-new", status: "sold", seller: "diya", img: IMG.keyboard, ageDays: 15 },
    { title: "Engineering Physics + Maths Reference Bundle", description: "First-year PHY + M-I/M-II reference books. Some wear.", price: 600, category: "Textbooks", condition: "fair", seller: "rohan", img: IMG.books, ageDays: 14 },
    { title: "Yonex Badminton Racket + Shuttles", description: "Lightweight racket with a tube of shuttles. Sports complex ready.", price: 900, category: "Sports", condition: "good", seller: "ananya", img: IMG.racket, ageDays: 12 },
    // new students
    { title: "Dell Inspiron 15 Laptop (i5, 8GB)", description: "Reliable coding laptop. Battery health good, charger included.", price: 24000, category: "Electronics", condition: "good", seller: "arjun", img: IMG.laptop, ageDays: 26 },
    { title: "Sony WH-1000XM4 Headphones", description: "Noise-cancelling over-ear. Great for library focus. With case.", price: 9500, category: "Electronics", condition: "like-new", seller: "priya", img: IMG.headphones, ageDays: 23 },
    { title: "boAt Airdopes 141 (TWS Earbuds)", description: "Wireless earbuds, solid battery. Selling — got a new pair.", price: 700, category: "Electronics", condition: "good", seller: "sneha", img: IMG.earbuds, ageDays: 21 },
    { title: "Yamaha F310 Acoustic Guitar", description: "Beginner-friendly acoustic. Minor scratches, sounds great.", price: 6500, category: "Other", condition: "good", seller: "karan", img: IMG.guitar, ageDays: 20 },
    { title: "Nike Revolution Running Shoes (UK 9)", description: "Lightly used running shoes. Perfect for morning runs.", price: 1600, category: "Clothing", condition: "like-new", seller: "isha", img: IMG.sneakers, ageDays: 19 },
    { title: "Canon EOS 1500D DSLR", description: "Entry DSLR with 18-55mm kit lens. Great for the photography club.", price: 21000, category: "Electronics", condition: "good", seller: "vikram", img: IMG.camera, ageDays: 18 },
    { title: "Titan Neo Analog Watch", description: "Classic analog watch, leather strap. Barely worn.", price: 1800, category: "Other", condition: "like-new", seller: "neha", img: IMG.watch, ageDays: 17 },
    { title: "American Tourister 32L Backpack", description: "Spacious laptop backpack, all zips working. Pickup H-5.", price: 900, category: "Other", condition: "good", seller: "aditya", img: IMG.backpack, ageDays: 16 },
    { title: "Rechargeable LED Study Lamp", description: "Eye-care desk lamp, 3 brightness modes. Great for night study.", price: 550, category: "Other", condition: "good", seller: "riya", img: IMG.lamp, ageDays: 15 },
    { title: "Ray-Ban Wayfarer Sunglasses", description: "Original Wayfarers with case. Hardly used.", price: 3500, category: "Clothing", condition: "like-new", seller: "sid", img: IMG.sunglasses, ageDays: 14 },
    { title: "SS English Willow Cricket Bat", description: "Lightly knocked-in bat, good for tennis & season ball.", price: 2200, category: "Sports", condition: "good", seller: "tanvi", img: IMG.cricketBat, ageDays: 13 },
    { title: "Mini Fridge 45L", description: "Compact hostel fridge. Keeps drinks cold, low power.", price: 4500, category: "Electronics", condition: "good", status: "reserved", seller: "harsh", img: IMG.fridge, ageDays: 12 },
    { title: "65W Type-C Fast Charger", description: "Brand-new spare charger, fast-charges most laptops/phones.", price: 1100, category: "Electronics", condition: "new", seller: "pooja", img: IMG.charger, ageDays: 10 },
    { title: "Cotton Round-Neck T-Shirts (Pack of 3)", description: "Unworn plain tees, size M. Black/white/grey.", price: 600, category: "Clothing", condition: "new", seller: "rahul", img: IMG.tshirt, ageDays: 9 },
    { title: "Milton Steel Water Bottle 1L", description: "Insulated steel bottle, keeps water cold for hours.", price: 350, category: "Other", condition: "good", seller: "meera", img: IMG.bottle, ageDays: 8 },
    { title: "iPhone 11 (64GB, Black)", description: "Good condition iPhone 11. Battery 84%. No scratches on screen.", price: 18000, category: "Electronics", condition: "good", status: "sold", seller: "nikhil", img: IMG.phone, ageDays: 7 },
    { title: "Engineering Drawing Sheets + Notebook Set", description: "First-year ED sheets, instruments and notebooks. Combo deal.", price: 300, category: "Textbooks", condition: "good", seller: "ayesha", img: IMG.notebook, ageDays: 6 },
    { title: "Ceramic Coffee Mug Set (x4)", description: "Set of four mugs for the hostel room. No chips.", price: 400, category: "Other", condition: "like-new", seller: "dev", img: IMG.mug, ageDays: 5 },
    { title: "Blue-Light Reading Glasses", description: "Zero-power computer glasses. Reduces eye strain. New.", price: 450, category: "Other", condition: "new", seller: "kavya", img: IMG.glasses, ageDays: 4 },
    { title: "Hostel Study Chair (Cushioned)", description: "Comfortable study chair, good back support. Pickup H-3.", price: 1300, category: "Furniture", condition: "good", seller: "rohit", img: IMG.chair, ageDays: 3 },
  ];
  const listings = listingDefs.map((l) => ({
    title: l.title,
    description: l.description,
    price: l.price,
    category: l.category,
    condition: l.condition,
    status: l.status || "available",
    seller: uid(l.seller),
    university: university._id,
    images: [l.img],
    createdAt: daysAgo(l.ageDays),
    updatedAt: daysAgo(l.ageDays),
  }));
  await Listing.insertMany(listings, { timestamps: false });
  console.log(`✓ Inserted ${listings.length} listings (all with photos)`);

  // 5) Lost & Found — every item carries a real photo too.
  const lfDefs = [
    { title: "Lost: Black Leather Wallet", description: "Lost near Central Library — has some cash and a metro card. No questions asked.", kind: "lost", category: "Accessories", location: "Central Library", reporter: "priya", img: IMG.wallet, ageDays: 14 },
    { title: "Found: Bunch of Keys", description: "Found a set of keys with a blue keychain outside H-7. Collect from the warden.", kind: "found", category: "Keys", location: "Hostel H-7 gate", reporter: "rohan", img: IMG.keys, ageDays: 13 },
    { title: "Lost: Blue Folding Umbrella", description: "Left a blue umbrella in the NTB lecture hall after the morning class.", kind: "lost", category: "Accessories", location: "New Teaching Block", reporter: "sneha", img: IMG.umbrella, ageDays: 12 },
    { title: "Found: Student ID Card", description: "Found an ID card near the canteen. DM to identify and collect.", kind: "found", category: "ID & Cards", location: "Main Canteen", reporter: "karan", img: IMG.idCard, ageDays: 11 },
    { title: "Lost: boAt Earbuds Case", description: "Misplaced my earbuds case at the sports complex. Small reward if found.", kind: "lost", category: "Electronics", location: "Sports Complex", reporter: "isha", img: IMG.earbuds, ageDays: 10 },
    { title: "Found: Casio Wristwatch", description: "Found a wristwatch on a bench in the Lecture Hall Complex.", kind: "found", category: "Accessories", location: "Lecture Hall Complex", reporter: "vikram", img: IMG.watch, ageDays: 9 },
    { title: "Lost: Black-Frame Spectacles", description: "Lost my spectacles near the bus stop. Can't see well without them!", kind: "lost", category: "Accessories", location: "Main Gate Bus Stop", reporter: "neha", img: IMG.glasses, ageDays: 8, status: "returned" },
    { title: "Found: Steel Water Bottle", description: "Someone left a steel bottle at the gym. Kept at the reception.", kind: "found", category: "Other", location: "Gymnasium", reporter: "aditya", img: IMG.bottle, ageDays: 7 },
    { title: "Lost: Type-C Laptop Charger", description: "Lost my laptop charger on the 2nd floor of the library.", kind: "lost", category: "Electronics", location: "Central Library, 2nd Floor", reporter: "riya", img: IMG.charger, ageDays: 6 },
    { title: "Found: Engineering Maths Notebook", description: "Found an M-II notebook in NTB Room 204. Name starts with 'S'.", kind: "found", category: "Books & Notes", location: "NTB, Room 204", reporter: "sid", img: IMG.notebook, ageDays: 5 },
    { title: "Lost: Hostel Room Keys", description: "Dropped my room keys somewhere near the mess. Please help!", kind: "lost", category: "Keys", location: "Hostel Mess", reporter: "tanvi", img: IMG.keys, ageDays: 4 },
    { title: "Found: Red Hoodie", description: "Found a red hoodie on the sports ground after practice.", kind: "found", category: "Clothing", location: "Sports Ground", reporter: "harsh", img: IMG.tshirt, ageDays: 3, status: "returned" },
    { title: "Lost: Black Backpack", description: "Left my backpack in the academic block. Has notes and a calculator.", kind: "lost", category: "Accessories", location: "Academic Block", reporter: "pooja", img: IMG.backpack, ageDays: 2 },
    { title: "Found: Scientific Calculator", description: "Found a Casio calculator in the exam hall. Collect with proof.", kind: "found", category: "Electronics", location: "Exam Hall", reporter: "meera", img: IMG.calculator, ageDays: 1 },
  ];
  const lostFound = lfDefs.map((i) => ({
    title: i.title,
    description: i.description,
    kind: i.kind,
    category: i.category,
    location: i.location,
    status: i.status || "open",
    reporter: uid(i.reporter),
    university: university._id,
    images: [i.img],
    createdAt: daysAgo(i.ageDays),
    updatedAt: daysAgo(i.ageDays),
  }));
  await LostFoundItem.insertMany(lostFound, { timestamps: false });
  console.log(`✓ Inserted ${lostFound.length} lost & found items (all with photos)`);

  // 6) Study groups (use .create so the creator is auto-added to members)
  const groups = [
    {
      name: "DSA & CP Grind (Weekly)", subject: "Computer Science",
      description: "Weekly LeetCode + Codeforces solving sessions. All levels welcome.",
      tags: ["algorithms", "leetcode", "cp"], maxMembers: 15,
      creator: uid("aarav"), members: [uid("aarav"), uid("rohan"), uid("diya"), uid("arjun"), uid("karan"), uid("nikhil")],
      links: { whatsapp: "https://chat.whatsapp.com/manit-dsa-grind" },
      nextSession: { at: inDays(2), mode: "online", location: "Online", meetingLink: "https://meet.google.com/dsa-grind" },
    },
    {
      name: "GATE CSE 2026 Prep", subject: "Computer Science",
      description: "Subject-wise theory + weekly mock tests for GATE CSE 2026.",
      tags: ["gate", "theory", "mock-tests"], maxMembers: 25,
      creator: uid("diya"), members: [uid("diya"), uid("ananya"), uid("isha"), uid("neha")],
      links: { telegram: "https://t.me/manit-gate-cse" },
      nextSession: { at: inDays(3), mode: "offline", location: "Central Library, 2nd Floor" },
    },
    {
      name: "DBMS + OS Revision", subject: "Computer Science",
      description: "Pre-exam revision for DBMS and Operating Systems. SQL practice included.",
      tags: ["dbms", "os", "sql"], maxMembers: 12,
      creator: uid("rohan"), members: [uid("rohan"), uid("aarav"), uid("sid"), uid("harsh")],
    },
    {
      name: "Engineering Mathematics Doubt-Solving", subject: "Mathematics",
      description: "Bring your M-I / M-II doubts. Calculus, linear algebra, probability.",
      tags: ["calculus", "linear-algebra", "probability"], maxMembers: 20,
      creator: uid("ananya"), members: [uid("ananya"), uid("diya"), uid("riya"), uid("kavya")],
      nextSession: { at: inDays(1), mode: "offline", location: "NTB, Room 204" },
    },
    {
      name: "Web Dev Project Club (MERN)", subject: "Engineering",
      description: "Build full-stack projects together — React, Node, Express, MongoDB.",
      tags: ["react", "node", "mongodb", "projects"], maxMembers: 18,
      creator: uid("aarav"), members: [uid("aarav"), uid("rohan"), uid("ananya"), uid("priya"), uid("dev"), uid("rohit")],
      links: { discord: "https://discord.gg/manit-webdev" },
      customLinks: [{ label: "GitHub", url: "https://github.com/manit-webdev-club" }],
      nextSession: { at: inDays(5), mode: "online", location: "Online", meetingLink: "https://meet.google.com/manit-mern" },
    },
    {
      name: "Physics for First-Years", subject: "Physics",
      description: "Semester-1 mechanics and modern physics. Peer teaching welcome.",
      tags: ["mechanics", "semester-1"], maxMembers: 30,
      creator: uid("diya"), members: [uid("diya"), uid("ayesha"), uid("meera")],
    },
    {
      name: "Aptitude & Placement Prep", subject: "Other",
      description: "Quant, logical reasoning and interview prep for placements & internships.",
      tags: ["aptitude", "placements", "interviews"], maxMembers: 40,
      creator: uid("rohan"), members: [uid("rohan"), uid("aarav"), uid("diya"), uid("ananya"), uid("arjun"), uid("pooja"), uid("rahul")],
      links: { whatsapp: "https://chat.whatsapp.com/manit-placements" },
      nextSession: { at: inDays(4), mode: "offline", location: "Seminar Hall, NTB" },
    },
    // groups led by new students
    {
      name: "Photography Club Meetups", subject: "Other",
      description: "Campus photo walks and editing basics. Bring any camera or phone.",
      tags: ["photography", "editing"], maxMembers: 25,
      creator: uid("vikram"), members: [uid("vikram"), uid("priya"), uid("dev")],
      nextSession: { at: inDays(6), mode: "offline", location: "Main Gate (meet point)" },
    },
    {
      name: "Placement Coding Sprints", subject: "Computer Science",
      description: "Daily DSA + system design prep for upcoming placements.",
      tags: ["dsa", "system-design", "placements"], maxMembers: 30,
      creator: uid("arjun"), members: [uid("arjun"), uid("karan"), uid("nikhil"), uid("rohit")],
      links: { telegram: "https://t.me/manit-placement-sprints" },
      nextSession: { at: inDays(2), mode: "online", location: "Online", meetingLink: "https://meet.google.com/placement-sprint" },
    },
    {
      name: "English & Soft Skills Circle", subject: "Other",
      description: "Group discussions, mock interviews and presentation practice.",
      tags: ["communication", "interviews"], maxMembers: 20,
      creator: uid("ayesha"), members: [uid("ayesha"), uid("meera"), uid("neha"), uid("riya")],
      nextSession: { at: inDays(7), mode: "offline", location: "Seminar Hall, NTB" },
    },
  ].map((g) => ({ ...g, university: university._id }));

  for (const g of groups) {
    await StudyGroup.create(g);
  }
  console.log(`✓ Inserted ${groups.length} study groups`);

  // 7) Friend graph — accepted friendships + a few pending requests.
  const fDocs = [];
  const pushF = (reqId, recId, status, ageDays) => {
    const users = [reqId, recId].map(String).sort();
    const createdAt = daysAgo(ageDays + 1);
    const updatedAt = status === "accepted" ? daysAgo(ageDays) : createdAt;
    fDocs.push({
      requester: reqId,
      recipient: recId,
      users,
      pairKey: users.join("_"),
      status,
      university: university._id,
      createdAt,
      updatedAt,
    });
  };

  const acceptedPairs = [
    ["priya", "arjun", 22], ["priya", "sneha", 21], ["priya", "isha", 20],
    ["arjun", "karan", 19], ["arjun", "vikram", 18],
    ["sneha", "riya", 17], ["sneha", "tanvi", 16],
    ["karan", "aditya", 15], ["karan", "nikhil", 14],
    ["isha", "kavya", 13], ["isha", "ayesha", 12],
    ["vikram", "harsh", 11], ["vikram", "dev", 10],
    ["neha", "pooja", 9], ["neha", "rahul", 8],
    ["aditya", "sid", 7], ["riya", "kavya", 6],
    ["tanvi", "pooja", 5], ["harsh", "rahul", 4],
    ["nikhil", "dev", 3], ["ayesha", "meera", 9],
    ["rohit", "dev", 6], ["rohit", "arjun", 8],
    ["aarav", "priya", 24], ["diya", "sneha", 23],
    ["rohan", "karan", 22], ["ananya", "isha", 21],
    ["aarav", "rohan", 26], ["diya", "ananya", 25],
    ["meera", "kavya", 12],
  ];
  const pendingPairs = [
    ["harsh", "priya", 5], ["nikhil", "sneha", 4],
  ];
  for (const [a, b, age] of acceptedPairs) pushF(uid(a), uid(b), "accepted", age);
  for (const [a, b, age] of pendingPairs) pushF(uid(a), uid(b), "pending", age);

  if (primaryOk) {
    // accepted friends of the primary user
    for (const [k, age] of [["priya", 18], ["arjun", 17], ["sneha", 16], ["aarav", 20], ["diya", 19], ["karan", 15], ["neha", 10]]) {
      pushF(uid(k), primary._id, "accepted", age);
    }
    // incoming pending requests (show up in your "requests" tab)
    for (const [k, age] of [["vikram", 6], ["isha", 5], ["aditya", 4]]) {
      pushF(uid(k), primary._id, "pending", age);
    }
    // one outgoing pending request from you
    for (const [k, age] of [["rahul", 3]]) {
      pushF(primary._id, uid(k), "pending", age);
    }
  }

  // dedup by pairKey (guards the unique index if SEED_PRIMARY_EMAIL is a seed acct)
  const seenPK = new Set();
  const fUnique = fDocs.filter((d) => (seenPK.has(d.pairKey) ? false : (seenPK.add(d.pairKey), true)));
  await Friendship.insertMany(fUnique, { timestamps: false });
  const acceptedCount = fUnique.filter((f) => f.status === "accepted").length;
  console.log(`✓ Inserted ${fUnique.length} friendships (${acceptedCount} accepted, ${fUnique.length - acceptedCount} pending)`);

  // 8) Conversations + messages, spread across the 30-day window.
  let convCount = 0;
  let msgCount = 0;

  // 8a) Marketplace chats — primary user <-> a demo seller, about a listing.
  if (primaryOk) {
    const listingConvos = [
      { sellerKey: "aarav", title: 'HP 22" Full-HD Monitor', startDaysAgo: 11, thread: [
        ["me", "Hi! Is the HP monitor still available?"],
        ["seller", "Yes, it is! Barely used, works perfectly."],
        ["me", "Great. Would you take ₹5000?"],
        ["seller", "Can do ₹5200 and I'll throw in the HDMI cable.", "unread"],
      ]},
      { sellerKey: "rohan", title: "Casio FX-991EX Scientific Calculator", startDaysAgo: 19, thread: [
        ["me", "Is the Casio calculator still up for sale?"],
        ["seller", "Yep, ₹750 — comes with the cover."],
        ["me", "Perfect, can I pick it up from your hostel this evening?"],
      ]},
      { sellerKey: "diya", title: "Hercules Roadeo 26T Cycle", startDaysAgo: 12, thread: [
        ["me", "Interested in the cycle. How are the tyres and brakes?"],
        ["seller", "Both tyres are fine and the brakes are new — rides smooth."],
        ["seller", "I can show you near H-7 whenever you're free.", "unread"],
      ]},
      { sellerKey: "ananya", title: "Yonex Badminton Racket + Shuttles", startDaysAgo: 4, thread: [
        ["me", "Hey, is the Yonex racket still available?"],
        ["seller", "Hi! Yes it is, and it comes with a tube of shuttles.", "unread"],
      ]},
    ];

    for (const spec of listingConvos) {
      const seller = byKey[spec.sellerKey];
      const listing = await Listing.findOne({ title: spec.title, seller: seller._id });
      if (!listing) {
        console.log(`  ! listing not found for conversation: ${spec.title}`);
        continue;
      }
      const participants = [String(primary._id), String(seller._id)].sort();
      const conversation = await Conversation.create({
        listingId: listing._id,
        contextType: "listing",
        listingTitle: listing.title,
        participants,
        university: university._id,
      });

      const start = daysAgo(spec.startDaysAgo).getTime();
      const docs = spec.thread.map((m, i) => {
        const when = new Date(start + i * 13 * 60 * 1000); // ~13 min apart
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
  }

  // 8b) Friend DMs (the "chat with friends" feature). NOTE: friend DMs all have
  //     listingId=null, and the unique {listingId, participants} index is
  //     multikey — so a user can be in at most ONE null-listing conversation.
  //     We therefore only seed DISJOINT pairs (no user appears twice).
  const friendConvos = [
    { a: "__primary__", b: "priya", startDaysAgo: 9, thread: [
      ["a", "Hey Priya! Are you going to the DSA session tomorrow?"],
      ["b", "Yeah, planning to! Want to grab seats together?"],
      ["a", "Perfect, let's meet at the library entrance at 5."],
      ["b", "Done. I'll bring my notes from last week.", "unread"],
    ]},
    { a: "arjun", b: "karan", startDaysAgo: 14, thread: [
      ["a", "Bro, did you finish the OS assignment?"],
      ["b", "Almost — stuck on the scheduling part."],
      ["a", "Same. Let's pair up this evening?"],
      ["b", "Sounds good, ping me after mess."],
    ]},
    { a: "sneha", b: "riya", startDaysAgo: 5, thread: [
      ["a", "Riya, are you still selling your study lamp?"],
      ["b", "Yes! It's up on the marketplace now 🙂"],
      ["a", "Awesome, I'll reserve it."],
    ]},
  ];

  for (const spec of friendConvos) {
    const aUser = spec.a === "__primary__" ? (primaryOk ? primary : null) : byKey[spec.a];
    const bUser = byKey[spec.b];
    if (!aUser || !bUser) continue;

    const participants = [String(aUser._id), String(bUser._id)].sort();
    const conversation = await Conversation.create({
      listingId: null,
      contextType: "friend",
      listingTitle: "",
      participants,
      university: university._id,
    });

    const start = daysAgo(spec.startDaysAgo).getTime();
    const docs = spec.thread.map((m, i) => {
      const when = new Date(start + i * 37 * 60 * 1000); // ~37 min apart
      return {
        conversation: conversation._id,
        sender: m[0] === "a" ? aUser._id : bUser._id,
        university: university._id,
        content: m[1],
        readAt: m[2] === "unread" ? null : new Date(when.getTime() + 90 * 1000),
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
  console.log(`✓ Seeded ${convCount} conversations (${msgCount} messages)`);

  // 9) Notifications — ONLY for the primary user (private to their account).
  if (primaryOk) {
    const notifDefs = [
      { type: "system", title: "Welcome to Manit Hub 🎓", description: "Your campus hub for NIT Bhopal is ready — explore the marketplace, study groups and campus maps.", read: true, days: 29 },
      { type: "marketplace", title: "New in Textbooks", description: "“GATE 2026 CSE — Made Easy Full Set” was just listed for ₹1,800.", read: true, days: 27 },
      { type: "study-group", title: "New study group: DSA & CP Grind", description: "A Computer Science group is now open to join.", read: true, days: 24 },
      { type: "marketplace", title: "On your radar", description: "Casio FX-991EX Scientific Calculator is available for ₹750.", read: true, days: 20 },
      { type: "friend", title: "Friend request accepted", description: "Priya Nair (@priya_nair) accepted your friend request.", read: true, days: 18 },
      { type: "message", title: "New message from Aarav Mehta", description: '“Can do ₹5,200 and I\'ll throw in the HDMI cable.” — HP 22" Full-HD Monitor', read: true, days: 11 },
      { type: "message", title: "New message from Diya Sharma", description: "“I can show you near H-7 whenever you're free.” — Hercules Roadeo 26T Cycle", read: true, days: 12 },
      { type: "friend", title: "New friend request", description: "Vikram Rao (@vikram_rao) sent you a friend request.", read: false, days: 6 },
      { type: "system", title: "Complete your profile", description: "Add a photo and a short bio so other students recognise you.", read: false, days: 3 },
      { type: "study-group", title: "Session reminder: GATE CSE 2026 Prep", description: "Next meetup at Central Library, 2nd Floor in 3 days.", read: false, days: 1 },
    ];
    const notifs = notifDefs.map((n) => ({
      user: primary._id,
      type: n.type,
      title: n.title,
      description: n.description,
      read: n.read,
      createdAt: daysAgo(n.days),
      updatedAt: daysAgo(n.days),
    }));

    const titles = notifs.map((n) => n.title);
    const delN = await Notification.deleteMany({ user: primary._id, title: { $in: titles } });
    await Notification.insertMany(notifs, { timestamps: false });
    const unread = notifs.filter((n) => !n.read).length;
    console.log(`✓ Seeded ${notifs.length} notifications (${unread} unread, reset ${delN.deletedCount}) for ${primaryEmail}`);
  }

  await mongoose.disconnect();

  // ── Ready-to-use logins ─────────────────────────────────────────────────
  const ready = userDefs.filter((u) => u.ready);
  console.log(`\n✓ Seed complete — data spread across the last ${SEED_WINDOW_DAYS} days.`);
  console.log(`  All ${userDefs.length} seed accounts share the password: ${DEMO_PASSWORD}`);
  console.log("\n  5 ready-to-use logins:");
  for (const u of ready) {
    console.log(`    • ${u.displayName.padEnd(16)} ${u.email}  /  ${DEMO_PASSWORD}`);
  }
  console.log("");
}

run().catch(async (err) => {
  console.error("✗ Seed failed:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
