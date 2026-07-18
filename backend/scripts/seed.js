/**
 * Seed script — simulates ~2.5 months (75 days) of a GROWING campus platform
 * for MANIT / NIT Bhopal. It populates every feature (marketplace, offers,
 * lost & found, study groups, confessions, rides, events, Q&A forum, study
 * vault, friends, chats, academics, attendance, timetable, push tokens) plus
 * moderation data (reports, strikes, suspensions), with a rising signup rate so
 * the admin/CEO dashboard's growth charts trend upward.
 *
 * Usage:  cd backend && npm run seed
 * Reads MONGO_URI from backend/.env.
 *
 * DETERMINISTIC + IDEMPOTENT: a seeded PRNG generates the same users/content
 * every run, so it safely resets only the demo data it owns and regenerates it.
 * Real (non-seed) users and their data are never touched. Two accounts are
 * PROTECTED (updated in place, never deleted, password never changed):
 *   - 2311401212 (Samay Jain)  → made the SOLE admin
 *   - 2311401213 (Shanjhi Jain)
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const University = require("../models/University");
const User = require("../models/User");
const Listing = require("../models/Listing");
const Offer = require("../models/Offer");
const StudyGroup = require("../models/StudyGroup");
const LostFoundItem = require("../models/LostFoundItem");
const Friendship = require("../models/Friendship");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const Confession = require("../models/Confession");
const Ride = require("../models/Ride");
const Event = require("../models/Event");
const Question = require("../models/Question");
const Answer = require("../models/Answer");
const Document = require("../models/Document");
const Report = require("../models/Report");
const AcademicRecord = require("../models/AcademicRecord");
const AttendanceSubject = require("../models/AttendanceSubject");
const TimetableEntry = require("../models/TimetableEntry");
const DeviceToken = require("../models/DeviceToken");

const { POINTS } = require("../utils/gamification");

const STUDENT_DOMAIN = "stu.manit.ac.in";
const DEMO_PASSWORD = "password123";
const WINDOW = 75; // 2.5 months
const ADMIN_EMAIL = "2311401212@stu.manit.ac.in";
const SHANJHI_EMAIL = "2311401213@stu.manit.ac.in";
const CEO_GHOST_EMAIL = "0000000000@stu.manit.ac.in"; // old secret-admin account, removed
const PROTECTED_EMAILS = [ADMIN_EMAIL, SHANJHI_EMAIL];
// Durable record of the generated seed emails so re-runs replace (not
// accumulate) them. Lives in the gitignored backups dir.
const REGISTRY = path.join(__dirname, "..", "backups", ".seed-users.json");

// Target volumes (scale ~300 users).
const GEN_USERS = 276;
const N = {
  listings: 300, offers: 150, documents: 120, questions: 90,
  confessions: 70, rides: 60, events: 45, lostfound: 70, groups: 45,
  listingChats: 180, friendDMs: 30, reports: 120,
  academics: 150, attendance: 150, timetable: 120, deviceTokens: 80,
  strikes: 15, suspended: 7, notifUsers: 100,
};

// ── Seeded PRNG (mulberry32) — deterministic across runs ─────────────────────
let _s = 0x9e3779b9;
function rnd() {
  _s |= 0; _s = (_s + 0x6d2b79f5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const rint = (min, max) => min + Math.floor(rnd() * (max - min + 1));
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const chance = (p) => rnd() < p;
function pickN(arr, n) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

// ── Time helpers ─────────────────────────────────────────────────────────────
const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();
const daysAgo = (d) => new Date(now - d * DAY);
const inDays = (n) => new Date(now + n * DAY);
const futureAt = (days, hour) => { const d = inDays(days); d.setHours(hour, 0, 0, 0); return d; };
const ageOfDate = (d) => (now - new Date(d).getTime()) / DAY;

// Rising signup curve: recent days weighted heavier (day weight (r+1)^1.6).
const dayCum = [];
{ let acc = 0; for (let r = 0; r < WINDOW; r++) { acc += Math.pow(r + 1, 1.6); dayCum.push(acc); } }
const dayTotal = dayCum[WINDOW - 1];
function sampleAgeDays() {
  const x = rnd() * dayTotal;
  let r = 0; while (r < WINDOW - 1 && dayCum[r] < x) r++;
  return (WINDOW - 1 - r) + rnd(); // small ageDays (recent) most common
}
// A content date strictly after a user's signup, biased toward "now".
const contentAgeAfter = (signupAge) => signupAge * Math.pow(rnd(), 1.8);

// ── Assets ───────────────────────────────────────────────────────────────────
const U = (id) => `https://images.unsplash.com/photo-${id}?w=600&q=80`;
const IMG = {
  books: U("1544716278-ca5e3f4abd8c"), openBook: U("1532012197267-da84d127e765"),
  laptop: U("1517336714731-489689fd1ca8"), monitor: U("1527443224154-c4a3942d3acf"),
  keyboard: U("1587829741301-dc798b83add3"), headphones: U("1505740420928-5e560c06d30e"),
  bicycle: U("1485965120184-e220f721d03e"), phone: U("1511707171634-5f897ff02aa9"),
  guitar: U("1510915361894-db8b60106cb1"), sneakers: U("1542291026-7eec264c27ff"),
  camera: U("1502920917128-1aa500764cbd"), watch: U("1524805444758-089113d48a6d"),
  backpack: U("1553062407-98eeb64c6a62"), mug: U("1514228742587-6b1558fcca3d"),
  sunglasses: U("1572635196237-14b3f281503f"), notebook: U("1531346878377-a5be20888e57"),
  chair: U("1505843513577-22bb7d21e455"), fan: U("1565374395542-0ce18882c857"),
  labcoat: U("1581595220892-b0739db3ba8c"), racket: U("1626224583764-f87db24ac4ea"),
  umbrella: U("1534551767192-78b8dd45b51b"), keys: U("1582550945154-66ea8fff25e1"),
  wallet: U("1627123424574-724758594e93"), earbuds: U("1606220588913-b3aacb4d2f46"),
  lamp: U("1507473885765-e6ed057f782c"), bottle: U("1602143407151-7111542de6e8"),
  calculator: U("1564466809058-bf4114d55352"), tshirt: U("1521572163474-6864f9cf17ab"),
  fridge: U("1571175443880-49e1d25b2bc5"), cricketBat: U("1531415074968-036ba1b575da"),
  charger: U("1583863788434-e58a36330cf0"), idCard: U("1606166187734-a4cb74079037"),
  glasses: U("1574258495973-f010dfbb5371"), table: U("1611269154421-4e27233ac5c7"),
  cooler: U("1558618666-fcd25c85cd64"),
};
const pravatar = (n) => `https://i.pravatar.cc/200?img=${n}`;
const SAMPLE_PDF = "https://pdfobject.com/pdf/sample.pdf";
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// ── Pools ────────────────────────────────────────────────────────────────────
const FIRST = ["Aarav","Vivaan","Aditya","Vihaan","Arjun","Sai","Reyansh","Krishna","Ishaan","Rohan","Kabir","Ansh","Dhruv","Yuvraj","Aryan","Kartik","Nikhil","Rudra","Dev","Harsh","Manav","Om","Parth","Ritvik","Shaurya","Tanish","Ved","Yash","Ayush","Rahul","Karan","Siddharth","Aman","Raj","Varun","Nishant","Pranav","Gaurav","Sanjay","Akash","Ananya","Diya","Isha","Sneha","Priya","Riya","Kavya","Meera","Pooja","Neha","Tanvi","Ayesha","Aditi","Anjali","Bhavya","Chirag","Divya","Gauri","Ira","Jhanvi","Khushi","Lavanya","Mahi","Nandini","Palak","Rachana","Saanvi","Shreya","Trisha","Vaishnavi","Yamini","Simran","Nikita","Radhika","Sakshi","Muskan"];
const LAST = ["Sharma","Verma","Gupta","Iyer","Reddy","Nair","Menon","Patel","Shah","Jain","Singh","Kumar","Rao","Desai","Bhatt","Khanna","Pillai","Saxena","Malhotra","Agarwal","Joshi","Mehta","Chopra","Mishra","Tiwari","Pandey","Dubey","Chauhan","Yadav","Bansal","Goel","Kapoor","Sinha","Das","Ghosh","Bose","Mukherjee","Naidu","Chowdhury","Ahuja"];
const BIOS = ["CSE '26. Placement grind mode.","ECE. Photography + chai breaks.","Loves clean code and audio gear.","GATE aspirant, coffee addict.","Runner. Always at the sports complex.","Guitar, OS assignments and football.","Night-owl studier.","Gym + gadgets.","Mechanical engg. Cycling + chess.","Maths nerd, badminton on weekends.","Hostel fridge dealer. Always trading.","Aptitude prep + sketching.","Debugging by day, gaming by night.","Design club. Makes posters.","DSA every single day.","Chem engg. Hydration evangelist.","Cricketer, captain of the hostel team.","Blue-light glasses gang.","Fresher, figuring it all out.","Final-year, selling stuff before I graduate."];
const HOSTELS = ["H-3","H-4","H-5","H-6","H-7","H-8","H-9","H-10","H-11","H-12"];
const BRANCHES = ["CSE","ECE","EEE","Mechanical","Civil","Chemical","Mathematics","IT","Architecture","MME"];
const SUBJECTS = ["Data Structures","DBMS","Operating Systems","Computer Networks","Thermodynamics","Engineering Mathematics-I","Engineering Mathematics-II","Digital Electronics","Signals & Systems","Machine Learning","Fluid Mechanics","Structural Analysis","Microprocessors","Compiler Design","Theory of Computation","Discrete Mathematics","Probability & Statistics","Control Systems","Software Engineering","Analog Circuits"];
const GRADES = ["A+","A","A","B+","B+","B","B","C+","C","D"];

const LISTING_TEMPLATES = [
  { cat: "Textbooks", titles: ["CLRS Introduction to Algorithms","GATE 2026 Made Easy Full Set","Engineering Physics Reference","Operating Systems (Galvin)","Signals & Systems Textbook","M-I / M-II Reference Bundle","Digital Design (Morris Mano)","Data Structures Notes Book"], imgs: ["books","openBook","notebook"], min: 150, max: 2000 },
  { cat: "Electronics", titles: ["Casio FX-991EX Calculator","Dell Inspiron 15 Laptop","Sony WH-1000XM4 Headphones","boAt Airdopes Earbuds","HP 22\" Full-HD Monitor","Mechanical Keyboard + Mouse","65W Type-C Fast Charger","Mini Fridge 45L","Symphony Air Cooler","iPhone 11 (64GB)","Canon EOS 1500D DSLR","Table Fan","Power Bank 20000mAh"], imgs: ["laptop","monitor","keyboard","headphones","earbuds","charger","fridge","cooler","phone","camera","fan","calculator"], min: 300, max: 30000 },
  { cat: "Furniture", titles: ["Wooden Study Table","Cushioned Study Chair","Foldable Study Table","Small Bookshelf","Study Table + Chair Combo"], imgs: ["table","chair"], min: 500, max: 4000 },
  { cat: "Clothing", titles: ["White Lab Coat (M)","Nike Running Shoes (UK 9)","Cotton T-Shirts (Pack of 3)","Formal Blazer","Winter Hoodie","Ray-Ban Wayfarers"], imgs: ["labcoat","sneakers","tshirt","sunglasses"], min: 150, max: 3500 },
  { cat: "Sports", titles: ["Yonex Badminton Racket + Shuttles","SS Cricket Bat","Hercules Roadeo 26T Cycle","Football (Size 5)","Gym Dumbbell Set"], imgs: ["racket","cricketBat","bicycle"], min: 300, max: 4000 },
  { cat: "Other", titles: ["Yamaha F310 Acoustic Guitar","Ceramic Mug Set (x4)","LED Study Lamp","Milton Steel Bottle 1L","American Tourister 32L Backpack","Blue-Light Glasses","Folding Umbrella","Analog Wristwatch"], imgs: ["guitar","mug","lamp","bottle","backpack","glasses","umbrella","watch"], min: 150, max: 7000 },
];
const CONDITIONS = ["new", "like-new", "good", "good", "fair"];

const LF_TEMPLATES = [
  { title: "Black Leather Wallet", kind: "lost", category: "Accessories", loc: "Central Library", img: "wallet" },
  { title: "Bunch of Keys", kind: "found", category: "Keys", loc: "Hostel H-7 gate", img: "keys" },
  { title: "Blue Folding Umbrella", kind: "lost", category: "Accessories", loc: "New Teaching Block", img: "umbrella" },
  { title: "Student ID Card", kind: "found", category: "ID & Cards", loc: "Main Canteen", img: "idCard" },
  { title: "boAt Earbuds Case", kind: "lost", category: "Electronics", loc: "Sports Complex", img: "earbuds" },
  { title: "Casio Wristwatch", kind: "found", category: "Accessories", loc: "Lecture Hall Complex", img: "watch" },
  { title: "Black-Frame Spectacles", kind: "lost", category: "Accessories", loc: "Main Gate Bus Stop", img: "glasses" },
  { title: "Steel Water Bottle", kind: "found", category: "Other", loc: "Gymnasium", img: "bottle" },
  { title: "Type-C Laptop Charger", kind: "lost", category: "Electronics", loc: "Library, 2nd Floor", img: "charger" },
  { title: "Engineering Maths Notebook", kind: "found", category: "Books & Notes", loc: "NTB Room 204", img: "notebook" },
  { title: "Hostel Room Keys", kind: "lost", category: "Keys", loc: "Hostel Mess", img: "keys" },
  { title: "Scientific Calculator", kind: "found", category: "Electronics", loc: "Exam Hall", img: "calculator" },
  { title: "Red Hoodie", kind: "found", category: "Clothing", loc: "Sports Ground", img: "tshirt" },
  { title: "Black Backpack", kind: "lost", category: "Accessories", loc: "Academic Block", img: "backpack" },
];

const CONFESSIONS = [
  "Whoever keeps stealing the good chairs from the reading hall — I will find you. 😤",
  "Mess food today was actually edible. Marking this historic day in my calendar.",
  "I have a crush on someone from the library 2nd floor but I'm too shy to say hi. 🙈",
  "Spent the whole night debugging and the issue was a missing semicolon. I want to cry.",
  "Can we please get more power sockets in the lecture halls? My laptop dies by 11am.",
  "Shoutout to the senior who helped me with my DSA assignment — you're a legend. 🙏",
  "I pretend to understand thermodynamics but honestly I'm just vibing at this point.",
  "The H-7 night canteen Maggi is the only thing keeping my CGPA alive.",
  "Joined 4 clubs in first week and ghosted all of them by month two.",
  "Saw a cute dog near the academic block today and it made my entire week. 🐶",
  "Why does the wifi die exactly when the assignment is due? Every. Single. Time.",
  "To the person who returned my lost ID card — you restored my faith in humanity.",
  "Attendance is 74.6% and my heart cannot take this stress anymore.",
  "The library AC is colder than my ex's heart and I'm not complaining.",
  "Someone please start a queue system for the washing machines, I'm begging.",
  "Got a 9 SGPA and my parents asked why not 10. Indian parents undefeated.",
  "The samosa at the canteen hit different during placement season.",
  "I've walked past my crush 6 times today pretending I have somewhere to be.",
  "Late-night group study sessions are just gossip with textbooks open.",
  "Finally understood pointers and I feel like I unlocked a new dimension.",
];
const CONF_REACTS = ["heart", "laugh", "wow", "sad"];
const CONF_COMMENTS = ["This is too real 😭","Justice for us fr","We're all rooting for you 🥹","Same energy honestly","Facts. No notes.","Couldn't have said it better","Bookmarking this","LMAO the accuracy"];

const RIDE_FROM = ["MANIT Main Gate", "MANIT", "New Market", "DB City Mall"];
const RIDE_TO = ["Rani Kamlapati Station", "Bhopal Junction", "Bhopal Airport", "DB City Mall", "ISBT Bhopal", "Indore", "Habibganj (RKMP)", "New Market"];
const RIDE_NOTES = ["Splitting the cab fare, leaving sharp.","Auto share both ways.","Can drop you on the way.","Catching an early train.","Going home for the weekend.","Music guaranteed 🎶","Ping me to share the ride."];

const EVENT_TEMPLATES = [
  { title: "Spandan — Cultural Night", club: "Cultural Cell", category: "Cultural", venue: "Open Air Theatre" },
  { title: "TechnoSearch Hackathon", club: "ACM MANIT", category: "Technical", venue: "NTB Computer Labs" },
  { title: "Inter-Hostel Cricket Finals", club: "Sports Council", category: "Sports", venue: "Main Cricket Ground" },
  { title: "Hands-on ML with PyTorch", club: "Coding Club", category: "Workshop", venue: "CSE Seminar Hall" },
  { title: "Alumni Talk: Cracking Product Roles", club: "E-Cell", category: "Talk", venue: "Main Auditorium" },
  { title: "Photography Walk & Exhibition", club: "Shutterbugs", category: "Other", venue: "Campus Lake" },
  { title: "Robotics Expo", club: "Robotics Club", category: "Technical", venue: "Central Workshop" },
  { title: "Open Mic Night", club: "Literary Society", category: "Cultural", venue: "OAT" },
  { title: "Startup Pitch Fest", club: "E-Cell", category: "Talk", venue: "Seminar Hall, NTB" },
  { title: "Fitness Bootcamp", club: "Sports Council", category: "Sports", venue: "Sports Complex" },
];

const QUESTIONS = [
  { title: "How to prepare for GATE CSE alongside semester exams?", body: "The semester is heavy and I want to start GATE prep without tanking my CGPA. How did you balance both?", subject: "GATE" },
  { title: "Best resources for Operating Systems (our syllabus)?", body: "Looking for notes/videos that actually match the MANIT OS syllabus. Galvin is too much.", subject: "Operating Systems" },
  { title: "BFS vs DFS — when should I use which?", body: "I get how both work but always confused about which to pick in interview problems.", subject: "Data Structures" },
  { title: "How is the placement season for ECE branch?", body: "Curious about core vs IT roles for ECE. What's the realistic picture this year?", subject: "Placements" },
  { title: "Tips to improve CGPA after a rough first year?", body: "First year went badly. Is it possible to recover the CGPA meaningfully by final year?", subject: "General" },
  { title: "Which 6th-sem CSE electives are scoring?", body: "Trying to pick electives. Which ones are interesting AND grade-friendly?", subject: "Electives" },
  { title: "Anyone has notes for Engineering Mathematics-II?", body: "Specifically the linear algebra + complex analysis units. Exams are close 😅", subject: "Engineering Mathematics-II" },
  { title: "How to get started with competitive programming?", body: "Complete beginner. Which judge and what topic order do you recommend?", subject: "CP" },
  { title: "Is it worth doing a summer internship after 2nd year?", body: "Or should I focus on projects and DSA instead? Confused about priorities.", subject: "Internships" },
  { title: "Best way to revise DBMS in 3 days?", body: "End-sem in 3 days and I've barely started DBMS. SOS strategy needed.", subject: "DBMS" },
];
const ANSWERS = [
  "Start with the high-weight subjects that overlap your semester. 2 focused hours daily + PYQs on weekends is plenty early on.",
  "NPTEL's course matches our syllabus well. Pair it with the last 3 years' question papers.",
  "Rule of thumb: BFS for shortest path in unweighted graphs; DFS for connectivity, cycles and topological sort.",
  "Totally recoverable. Later semesters carry more credits, so consistent 8+ SGPAs pull the overall up fast.",
  "Check the Study Vault — someone uploaded unit-wise notes that are honestly gold.",
  "Make a single revision notebook per subject from day one; it doubles as exam + GATE revision later.",
  "Do projects AND some DSA. Balance beats going all-in on one thing this early.",
  "Machine Learning and Information Security were both interesting and scored well for our batch.",
];

const DOC_TYPES = ["Notes", "PYQ", "Syllabus", "Sem Schedule", "Other"];
const GROUP_TAGS = ["algorithms","leetcode","cp","gate","theory","mock-tests","dbms","os","sql","calculus","linear-algebra","react","node","mongodb","projects","mechanics","aptitude","placements","interviews","photography","system-design","communication"];
const GROUP_ADJ = ["Weekly", "Grind", "Prep", "Squad", "Circle", "Club", "Sprints", "Doubt-Solving"];

const NOTIF = [
  { type: "system", title: "Welcome to Manit Hub 🎓", description: "Your campus hub for NIT Bhopal is ready — explore the marketplace, study groups and campus maps." },
  { type: "marketplace", title: "New in Marketplace", description: "A listing you might like was just posted near your hostel." },
  { type: "study-group", title: "New study group", description: "A Computer Science group is now open to join." },
  { type: "friend", title: "Friend request accepted", description: "You have a new friend on Manit Hub." },
  { type: "message", title: "New message", description: "You have an unread message about a listing." },
  { type: "system", title: "Complete your profile", description: "Add a photo and a short bio so other students recognise you." },
  { type: "study-group", title: "Session reminder", description: "One of your study groups has an upcoming session." },
];
const BAN_REASONS = ["Repeated spam listings after warnings","Harassment reported by multiple users","Posting prohibited content in confessions","Fraudulent marketplace behaviour","Multiple community-guideline violations"];
const REPORT_REASONS = ["Spam or misleading","Inappropriate content","Harassment","Scam / fraud","Wrong category","Offensive language","Duplicate post"];

// Featured accounts (rich profiles). Shanjhi (2311401213) is handled as protected.
const featuredDefs = [
  { displayName: "Aarav Mehta", email: "2311401214@stu.manit.ac.in", handle: "aarav_mehta", avatar: 11, bio: "Final-year CSE. Selling stuff before I graduate." },
  { displayName: "Diya Sharma", email: "2311401215@stu.manit.ac.in", handle: "diya_sharma", avatar: 5, bio: "ECE '26. GATE aspirant, coffee addict." },
  { displayName: "Rohan Verma", email: "2311401216@stu.manit.ac.in", handle: "rohan_verma", avatar: 13, bio: "Mechanical engg. Cycling + chess." },
  { displayName: "Ananya Iyer", email: "2311401217@stu.manit.ac.in", handle: "ananya_iyer", avatar: 9, bio: "Maths nerd, badminton on weekends." },
  { displayName: "Arjun Reddy", email: "2311401218@stu.manit.ac.in", handle: "arjun.reddy", avatar: 12, bio: "Placement grind mode. DSA every day." },
  { displayName: "Sneha Gupta", email: "2311401219@stu.manit.ac.in", handle: "sneha_g", avatar: 45, bio: "EEE '26. Photography + chai breaks." },
  { displayName: "Karan Singh", email: "2311401220@stu.manit.ac.in", handle: "karan_singh", avatar: 33, bio: "Guitar, OS assignments and football." },
  { displayName: "Isha Patel", email: "2311401221@stu.manit.ac.in", handle: "isha.patel", avatar: 44, bio: "Runner. Civil engg." },
  { displayName: "Vikram Rao", email: "2311401222@stu.manit.ac.in", handle: "vikram_rao", avatar: 51, bio: "Photography club. Shoots campus events." },
  { displayName: "Neha Joshi", email: "2311401223@stu.manit.ac.in", handle: "neha_joshi", avatar: 32, bio: "Soft-skills circle organiser." },
  { displayName: "Aditya Kumar", email: "2311401224@stu.manit.ac.in", handle: "aditya_k", avatar: 53, bio: "Gym + gadgets. IT branch." },
  { displayName: "Riya Desai", email: "2311401225@stu.manit.ac.in", handle: "riya_desai", avatar: 26, bio: "Night-owl studier." },
  { displayName: "Siddharth Menon", email: "2311401226@stu.manit.ac.in", handle: "sid_menon", avatar: 60, bio: "Maths doubt-solver." },
  { displayName: "Tanvi Shah", email: "2311401227@stu.manit.ac.in", handle: "tanvi_shah", avatar: 25, bio: "Cricketer. Hostel team captain." },
  { displayName: "Harsh Agarwal", email: "2311401228@stu.manit.ac.in", handle: "harsh_a", avatar: 56, bio: "Hostel fridge dealer." },
  { displayName: "Pooja Bhatt", email: "2311401229@stu.manit.ac.in", handle: "pooja_bhatt", avatar: 31, bio: "Aptitude prep + sketching." },
  { displayName: "Rahul Khanna", email: "2311401230@stu.manit.ac.in", handle: "rahul_khanna", avatar: 58, bio: "Fresher. Selling spare gear." },
  { displayName: "Meera Pillai", email: "2311401231@stu.manit.ac.in", handle: "meera_pillai", avatar: 27, bio: "Chem engg. Hydration evangelist." },
  { displayName: "Nikhil Saxena", email: "2311401232@stu.manit.ac.in", handle: "nikhil_s", avatar: 59, bio: "Phone flipper. CSE '25." },
  { displayName: "Ayesha Khan", email: "2311401233@stu.manit.ac.in", handle: "ayesha_khan", avatar: 48, bio: "English circle lead." },
  { displayName: "Dev Malhotra", email: "2311401234@stu.manit.ac.in", handle: "dev_malhotra", avatar: 61, bio: "Coffee + cameras + code." },
  { displayName: "Kavya Reddy", email: "2311401235@stu.manit.ac.in", handle: "kavya_reddy", avatar: 28, bio: "Designs posters." },
  { displayName: "Rohit Sharma", email: "2311401236@stu.manit.ac.in", handle: "rohit_sharma", avatar: 64, bio: "Furniture & hostel essentials reseller." },
];

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) { console.error("✗ MONGO_URI is not set. Add it to backend/.env first."); process.exit(1); }
  await mongoose.connect(uri);
  console.log("✓ Connected to MongoDB");

  // 1) University
  let university = await University.findOne({ domains: STUDENT_DOMAIN });
  if (!university) {
    university = await University.create({ name: "Maulana Azad National Institute of Technology", domains: [STUDENT_DOMAIN], isVerified: true });
    console.log(`✓ Created university "${university.name}"`);
  } else {
    console.log(`✓ Using existing university "${university.name}"`);
  }
  const uniId = university._id;

  // 2) Generate the managed user set deterministically (emails + handles unique).
  const existing = await User.find({}, "email handle").lean();
  const usedEmails = new Set(existing.map((u) => u.email));
  const usedHandles = new Set(existing.map((u) => u.handle).filter(Boolean));
  const reserved = new Set([...PROTECTED_EMAILS, CEO_GHOST_EMAIL]);

  const uniqueHandle = (base) => {
    let h = String(base).toLowerCase().replace(/[^a-z0-9_.]/g, "").replace(/^[._]+|[._]+$/g, "");
    if (h.length < 3) h = `${h}xx`;
    h = h.slice(0, 20);
    let cand = h, i = 1;
    while (usedHandles.has(cand)) { const suf = String(i++); cand = h.slice(0, 20 - suf.length) + suf; }
    usedHandles.add(cand);
    return cand;
  };

  // Reserve featured handles up front.
  for (const f of featuredDefs) usedHandles.add(f.handle);

  // Scholar-number prefixes (7 digits) + 3-digit serial = 10 digits.
  const PREFIXES = ["2311401","2311402","2311403","2311301","2311302","2311501","2311601","2311701","2211401","2211402","2411401","2411402","2011401","2511401"];
  const emailPool = [];
  for (const p of PREFIXES) for (let s = 0; s < 1000; s++) emailPool.push(`${p}${String(s).padStart(3, "0")}@${STUDENT_DOMAIN}`);
  for (let i = emailPool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [emailPool[i], emailPool[j]] = [emailPool[j], emailPool[i]]; }

  const managedDefs = [];
  for (const f of featuredDefs) managedDefs.push({ ...f, avatarUrl: pravatar(f.avatar), featured: true });
  let ei = 0;
  for (let i = 0; i < GEN_USERS; i++) {
    let email;
    while (ei < emailPool.length) { const cand = emailPool[ei++]; if (!usedEmails.has(cand) && !reserved.has(cand)) { email = cand; break; } }
    if (!email) break;
    usedEmails.add(email);
    const displayName = `${pick(FIRST)} ${pick(LAST)}`;
    const handle = uniqueHandle(displayName.replace(/\s+/g, "_") + "_" + email.slice(6, 10));
    managedDefs.push({ displayName, email, handle, avatarUrl: pravatar(rint(1, 70)), bio: pick(BIOS), location: `Hostel ${pick(HOSTELS)}, MANIT` });
  }

  // Assign signup ages: oldest go to featured (early adopters), rest to generated.
  const ages = managedDefs.map(() => sampleAgeDays()).sort((a, b) => b - a); // desc (oldest first)
  managedDefs.forEach((d, i) => { d.ageDays = ages[i]; });

  // 3) Protected accounts
  const samay = await User.findOne({ email: ADMIN_EMAIL });
  const shanjhi = await User.findOne({ email: SHANJHI_EMAIL });
  if (!samay) console.log(`! Protected account ${ADMIN_EMAIL} not found — admin will not be set.`);
  if (!shanjhi) console.log(`! Protected account ${SHANJHI_EMAIL} not found — skipped.`);

  // 4) RESET — delete prior seed data. The seed owns the fixed featured emails,
  //    this run's generated emails, AND whatever generated emails a previous run
  //    recorded in the registry — so re-runs replace instead of accumulate, and
  //    real users (never in these sets) are untouched. Protected accounts' CONTENT
  //    is cleared (they're re-woven in) but their user docs/passwords are kept.
  const managedEmails = managedDefs.map((d) => d.email);
  let priorGenerated = [];
  try { priorGenerated = JSON.parse(fs.readFileSync(REGISTRY, "utf8")).generated || []; } catch { /* first run */ }
  const resetEmails = [...new Set([...managedEmails, ...priorGenerated])].filter((e) => !PROTECTED_EMAILS.includes(e));
  const priorManaged = await User.find({ email: { $in: resetEmails } }, "_id").lean();
  const seedOwnerIds = [
    ...priorManaged.map((u) => u._id),
    ...(samay ? [samay._id] : []),
    ...(shanjhi ? [shanjhi._id] : []),
  ];
  if (seedOwnerIds.length) {
    const ownerIn = { $in: seedOwnerIds };
    await Promise.all([
      Listing.deleteMany({ seller: ownerIn }),
      Offer.deleteMany({ $or: [{ buyer: ownerIn }, { seller: ownerIn }] }),
      StudyGroup.deleteMany({ creator: ownerIn }),
      LostFoundItem.deleteMany({ reporter: ownerIn }),
      Friendship.deleteMany({ users: ownerIn }),
      Confession.deleteMany({ author: ownerIn }),
      Ride.deleteMany({ poster: ownerIn }),
      Event.deleteMany({ organizer: ownerIn }),
      Question.deleteMany({ author: ownerIn }),
      Answer.deleteMany({ author: ownerIn }),
      Document.deleteMany({ uploader: ownerIn }),
      Notification.deleteMany({ user: ownerIn }),
      Report.deleteMany({ reporter: ownerIn }),
      AcademicRecord.deleteMany({ user: ownerIn }),
      AttendanceSubject.deleteMany({ user: ownerIn }),
      TimetableEntry.deleteMany({ user: ownerIn }),
      DeviceToken.deleteMany({ user: ownerIn }),
    ]);
    const scopeSet = new Set(seedOwnerIds.map(String));
    const convos = await Conversation.find({ participants: { $in: seedOwnerIds } }, "_id participants").lean();
    const seedConvoIds = convos.filter((c) => c.participants.every((p) => scopeSet.has(String(p)))).map((c) => c._id);
    await Message.deleteMany({ conversation: { $in: seedConvoIds } });
    await Conversation.deleteMany({ _id: { $in: seedConvoIds } });
    // delete previously-managed user docs (never the protected accounts)
    await User.deleteMany({ email: { $in: resetEmails } });
    console.log(`✓ Reset previous seed data (${seedOwnerIds.length} owners)`);
  }

  // 5) Insert managed users (single shared bcrypt hash — fast, bypasses hook).
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const managedUserDocs = managedDefs.map((d) => ({
    email: d.email, password: passwordHash, displayName: d.displayName, handle: d.handle,
    university: uniId, location: d.location || `Hostel ${pick(HOSTELS)}, MANIT`, bio: d.bio || pick(BIOS),
    avatarUrl: d.avatarUrl, emailVerified: chance(0.05) ? false : true,
    createdAt: daysAgo(d.ageDays), updatedAt: daysAgo(d.ageDays),
  }));
  const insertedUsers = await User.insertMany(managedUserDocs, { timestamps: false });
  // Record this run's generated emails so the next run cleans them up.
  try {
    fs.mkdirSync(path.dirname(REGISTRY), { recursive: true });
    fs.writeFileSync(REGISTRY, JSON.stringify({ generated: managedDefs.filter((d) => !d.featured).map((d) => d.email) }, null, 2));
  } catch (e) { console.log(`! Could not write seed registry: ${e.message}`); }
  console.log(`✓ Inserted ${insertedUsers.length} managed users (growth-curved)`);

  // Full participant pool: managed + protected (with signup ages).
  const users = insertedUsers.map((u, i) => ({ _id: u._id, ageDays: managedDefs[i].ageDays, email: u.email }));
  if (samay) users.push({ _id: samay._id, ageDays: Math.min(WINDOW - 1, Math.max(1, ageOfDate(samay.createdAt))), email: samay.email });
  if (shanjhi) users.push({ _id: shanjhi._id, ageDays: Math.min(WINDOW - 1, Math.max(1, ageOfDate(shanjhi.createdAt))), email: shanjhi.email });

  const eligible = (contentAge, excludeId) =>
    users.filter((u) => u.ageDays >= contentAge && (!excludeId || String(u._id) !== String(excludeId)));
  const pickEligible = (contentAge, excludeId) => { const e = eligible(contentAge, excludeId); return e.length ? e[rint(0, e.length - 1)] : null; };

  // Points/badges tally.
  const pointsBy = new Map();
  const badgesBy = new Map();
  const addPts = (id, action, badge) => {
    const k = String(id);
    pointsBy.set(k, (pointsBy.get(k) || 0) + (POINTS[action] || 0));
    if (badge) { if (!badgesBy.has(k)) badgesBy.set(k, new Set()); badgesBy.get(k).add(badge); }
  };

  // Reportable content registry: { type, id, ownerId, title, content, createdAt }.
  const reportable = [];

  // 6) Marketplace listings
  const listingRecords = [];
  const listingDocs = [];
  for (let i = 0; i < N.listings; i++) {
    const author = pick(users);
    const age = contentAgeAfter(author.ageDays);
    const tpl = pick(LISTING_TEMPLATES);
    const title = pick(tpl.titles);
    const price = rint(tpl.min, tpl.max);
    const status = chance(0.15) ? "sold" : chance(0.08) ? "reserved" : "available";
    const doc = {
      title, description: `${title}. ${pick(["Barely used.", "Good condition.", "Selling as I graduate.", "Pickup from hostel.", "No damage.", "Comes with accessories."])}`,
      price, category: tpl.cat, condition: pick(CONDITIONS), status,
      seller: author._id, university: uniId, images: [IMG[pick(tpl.imgs)]],
      createdAt: daysAgo(age), updatedAt: daysAgo(age),
    };
    listingDocs.push(doc);
    listingRecords.push({ title, price, seller: author._id, age });
    addPts(author._id, "listing_created");
  }
  const insertedListings = await Listing.insertMany(listingDocs, { timestamps: false });
  insertedListings.forEach((l, i) => {
    listingRecords[i]._id = l._id;
    reportable.push({ type: "listing", id: l._id, ownerId: l.seller, title: l.title, content: l.description, createdAt: l.createdAt });
  });
  console.log(`✓ Inserted ${insertedListings.length} listings`);

  // 7) Offers
  const offerDocs = [];
  const soldByOffer = [];
  for (let i = 0; i < N.offers; i++) {
    const l = pick(listingRecords);
    const buyer = pickEligible(l.age, l.seller);
    if (!buyer) continue;
    const oAge = l.age * Math.pow(rnd(), 1.3);
    const st = pick(["pending", "pending", "countered", "accepted", "declined", "withdrawn"]);
    const amount = Math.max(1, Math.round(l.price * (0.7 + rnd() * 0.25)));
    const o = { listing: l._id, buyer: buyer._id, seller: l.seller, university: uniId, amount, message: pick(["Would you take this?", "Interested, can we meet?", "Final price?", "Is this negotiable?", ""]).slice(0, 300), status: st, createdAt: daysAgo(oAge), updatedAt: daysAgo(oAge) };
    if (st === "countered") o.counterAmount = Math.round(amount * 1.1);
    offerDocs.push(o);
    if (st === "accepted") soldByOffer.push(l._id);
  }
  await Offer.insertMany(offerDocs, { timestamps: false });
  if (soldByOffer.length) await Listing.updateMany({ _id: { $in: soldByOffer } }, { $set: { status: "sold" } }, { timestamps: false });
  console.log(`✓ Inserted ${offerDocs.length} offers`);

  // 8) Lost & Found
  const lfDocs = [];
  for (let i = 0; i < N.lostfound; i++) {
    const author = pick(users);
    const age = contentAgeAfter(author.ageDays);
    const t = pick(LF_TEMPLATES);
    lfDocs.push({
      title: `${t.kind === "lost" ? "Lost" : "Found"}: ${t.title}`,
      description: `${t.kind === "lost" ? "Lost" : "Found"} near ${t.loc}. ${t.kind === "lost" ? "Please reach out if you find it." : "DM to identify and collect."}`,
      kind: t.kind, category: t.category, location: t.loc, status: chance(0.2) ? "returned" : "open",
      reporter: author._id, university: uniId, images: [IMG[t.img]], createdAt: daysAgo(age), updatedAt: daysAgo(age),
    });
    addPts(author._id, "lostfound_posted");
  }
  const insertedLF = await LostFoundItem.insertMany(lfDocs, { timestamps: false });
  insertedLF.forEach((d) => reportable.push({ type: "lostfound", id: d._id, ownerId: d.reporter, title: d.title, content: d.description, createdAt: d.createdAt }));
  console.log(`✓ Inserted ${insertedLF.length} lost & found items`);

  // 9) Study groups — insertMany (creator manually included in members) so
  //    createdAt honours the growth curve.
  const groupDocs = [];
  for (let i = 0; i < N.groups; i++) {
    const author = pick(users);
    const age = contentAgeAfter(author.ageDays);
    const subject = pick(SUBJECTS);
    const members = pickN(eligible(age, author._id).map((u) => u._id), rint(2, 8));
    const nearFuture = chance(0.4);
    groupDocs.push({
      name: `${subject.split(" ")[0]} ${pick(GROUP_ADJ)}`, subject, university: uniId,
      description: `Group for ${subject}. All levels welcome.`, tags: pickN(GROUP_TAGS, rint(2, 4)),
      creator: author._id, members: [author._id, ...members], maxMembers: rint(10, 40),
      nextSession: chance(0.6) ? { at: nearFuture ? futureAt(rint(1, 6), rint(9, 19)) : daysAgo(age * rnd()), mode: pick(["online", "offline"]), location: pick(["Online", "Central Library", "NTB Room 204", "Seminar Hall"]) } : undefined,
      notifications: { sessionReminderSent: true },
      createdAt: daysAgo(age), updatedAt: daysAgo(age),
    });
  }
  await StudyGroup.insertMany(groupDocs, { timestamps: false });
  console.log(`✓ Inserted ${groupDocs.length} study groups`);

  // 10) Confessions
  const confDocs = [];
  for (let i = 0; i < N.confessions; i++) {
    const author = pick(users);
    const age = contentAgeAfter(author.ageDays);
    const reactors = pickN(eligible(age, author._id), rint(2, 8));
    const reactions = reactors.map((u) => ({ user: u._id, type: pick(CONF_REACTS) }));
    const commenters = pickN(eligible(age, author._id), rint(0, 3));
    confDocs.push({
      author: author._id, university: uniId, content: pick(CONFESSIONS),
      reactions, reactionsCount: reactions.length,
      comments: commenters.map((u) => ({ author: u._id, content: pick(CONF_COMMENTS), createdAt: daysAgo(age * rnd()) })),
      createdAt: daysAgo(age), updatedAt: daysAgo(age),
    });
    addPts(author._id, "confession_posted");
  }
  const insertedConf = await Confession.insertMany(confDocs, { timestamps: false });
  insertedConf.forEach((d) => reportable.push({ type: "confession", id: d._id, ownerId: d.author, title: "Confession", content: d.content, createdAt: d.createdAt }));
  console.log(`✓ Inserted ${insertedConf.length} confessions`);

  // 11) Rides
  const rideDocs = [];
  for (let i = 0; i < N.rides; i++) {
    const author = pick(users);
    const age = contentAgeAfter(author.ageDays);
    const pax = pickN(eligible(age, author._id).map((u) => u._id), rint(0, 3));
    rideDocs.push({
      poster: author._id, university: uniId, from: pick(RIDE_FROM), to: pick(RIDE_TO),
      departureAt: chance(0.35) ? futureAt(rint(1, 7), rint(6, 20)) : daysAgo(age * rnd()),
      seatsTotal: rint(1, 6), passengers: pax, note: pick(RIDE_NOTES),
      createdAt: daysAgo(age), updatedAt: daysAgo(age),
    });
    addPts(author._id, "ride_posted", "Road Tripper");
  }
  const insertedRides = await Ride.insertMany(rideDocs, { timestamps: false });
  insertedRides.forEach((d) => reportable.push({ type: "ride", id: d._id, ownerId: d.poster, title: `${d.from} → ${d.to}`, content: d.note, createdAt: d.createdAt }));
  console.log(`✓ Inserted ${insertedRides.length} rides`);

  // 12) Events
  const eventDocs = [];
  for (let i = 0; i < N.events; i++) {
    const author = pick(users);
    const age = contentAgeAfter(author.ageDays);
    const t = pick(EVENT_TEMPLATES);
    const startAt = chance(0.5) ? futureAt(rint(1, 20), rint(9, 19)) : daysAgo(age * rnd());
    const attendees = pickN(eligible(age, author._id).map((u) => u._id), rint(3, 12));
    eventDocs.push({
      organizer: author._id, university: uniId, title: t.title, description: `${t.title} organised by ${t.club}. Everyone welcome!`,
      club: t.club, category: t.category, venue: t.venue, startAt, endAt: new Date(startAt.getTime() + rint(2, 5) * 3600 * 1000),
      attendees, reminderSent: true, createdAt: daysAgo(age), updatedAt: daysAgo(age),
    });
    addPts(author._id, "event_created", "Event Host");
  }
  const insertedEvents = await Event.insertMany(eventDocs, { timestamps: false });
  insertedEvents.forEach((d) => reportable.push({ type: "event", id: d._id, ownerId: d.organizer, title: d.title, content: d.description, createdAt: d.createdAt }));
  console.log(`✓ Inserted ${insertedEvents.length} events`);

  // 13) Q&A forum
  const qDocs = [];
  const qAges = [];
  for (let i = 0; i < N.questions; i++) {
    const author = pick(users);
    const age = contentAgeAfter(author.ageDays);
    const q = pick(QUESTIONS);
    const upv = pickN(eligible(age, author._id).map((u) => u._id), rint(0, 6));
    qDocs.push({ author: author._id, university: uniId, title: q.title, body: q.body, branch: pick(BRANCHES), subject: q.subject, semester: String(rint(1, 8)), upvotes: upv, upvoteCount: upv.length, answersCount: 0, acceptedAnswer: null, createdAt: daysAgo(age), updatedAt: daysAgo(age) });
    qAges.push(age);
    addPts(author._id, "question_posted");
  }
  const insertedQ = await Question.insertMany(qDocs, { timestamps: false });
  insertedQ.forEach((d) => reportable.push({ type: "question", id: d._id, ownerId: d.author, title: d.title, content: d.body, createdAt: d.createdAt }));

  const ansDocs = [];
  const ansMeta = [];
  for (let qi = 0; qi < insertedQ.length; qi++) {
    const q = insertedQ[qi];
    const qAge = qAges[qi];
    const nAns = rint(0, 3);
    for (let a = 0; a < nAns; a++) {
      const author = pickEligible(qAge, q.author);
      if (!author) continue;
      const aAge = qAge * Math.pow(rnd(), 1.4);
      const upv = pickN(eligible(aAge, author._id).map((u) => u._id), rint(0, 4));
      ansDocs.push({ question: q._id, author: author._id, university: uniId, body: pick(ANSWERS), upvotes: upv, upvoteCount: upv.length, createdAt: daysAgo(aAge), updatedAt: daysAgo(aAge) });
      ansMeta.push({ qi, author: author._id, accept: a === 0 && chance(0.5) });
      addPts(author._id, "answer_posted");
    }
  }
  const insertedA = await Answer.insertMany(ansDocs, { timestamps: false });
  insertedA.forEach((d) => reportable.push({ type: "answer", id: d._id, ownerId: d.author, title: "Answer", content: d.body, createdAt: d.createdAt }));
  const byQ = {};
  insertedA.forEach((a, i) => { const qi = ansMeta[i].qi; (byQ[qi] = byQ[qi] || []).push({ id: a._id, accept: ansMeta[i].accept, author: ansMeta[i].author }); });
  for (const [qi, list] of Object.entries(byQ)) {
    const acc = list.find((x) => x.accept);
    await Question.updateOne({ _id: insertedQ[qi]._id }, { $set: { answersCount: list.length, acceptedAnswer: acc ? acc.id : null } }, { timestamps: false });
    if (acc) addPts(acc.author, "answer_accepted", "Problem Solver");
  }
  console.log(`✓ Inserted ${insertedQ.length} questions + ${insertedA.length} answers`);

  // 14) Study Vault documents
  const docDocs = [];
  for (let i = 0; i < N.documents; i++) {
    const author = pick(users);
    const age = contentAgeAfter(author.ageDays);
    const subject = pick(SUBJECTS);
    const type = pick(DOC_TYPES);
    const title = `${subject} ${type === "PYQ" ? "PYQ (2021–2024)" : type === "Syllabus" ? "Syllabus" : type === "Sem Schedule" ? "Exam Schedule" : "Notes"}`;
    const upv = pickN(eligible(age, author._id).map((u) => u._id), rint(0, 8));
    docDocs.push({
      title, description: `${subject} ${type.toLowerCase()} — clean and complete.`, type,
      branch: pick(BRANCHES), subject, semester: String(rint(1, 8)),
      fileUrl: SAMPLE_PDF, fileName: `${slugify(title)}.pdf`, fileFormat: "pdf", fileSize: rint(400, 5000) * 1024,
      uploader: author._id, university: uniId, downloadCount: rint(0, 400), upvotes: upv, upvoteCount: upv.length,
      createdAt: daysAgo(age), updatedAt: daysAgo(age),
    });
    addPts(author._id, "document_upload", "Note Sharer");
  }
  const insertedDocs = await Document.insertMany(docDocs, { timestamps: false });
  insertedDocs.forEach((d) => reportable.push({ type: "document", id: d._id, ownerId: d.uploader, title: d.title, content: d.description, createdAt: d.createdAt }));
  console.log(`✓ Inserted ${insertedDocs.length} study-vault documents`);

  // 15) Friend graph
  const fDocs = [];
  const seenPK = new Set();
  for (const u of users) {
    const friends = pickN(users.filter((o) => String(o._id) !== String(u._id)), rint(2, 6));
    for (const f of friends) {
      const sorted = [String(u._id), String(f._id)].sort();
      const pairKey = sorted.join("_");
      if (seenPK.has(pairKey)) continue;
      seenPK.add(pairKey);
      const cap = Math.min(u.ageDays, f.ageDays);
      const age = cap * Math.pow(rnd(), 1.4);
      const status = chance(0.85) ? "accepted" : "pending";
      fDocs.push({ requester: u._id, recipient: f._id, users: sorted, pairKey, status, university: uniId, createdAt: daysAgo(age + 0.5), updatedAt: daysAgo(status === "accepted" ? age : age + 0.5) });
    }
  }
  await Friendship.insertMany(fDocs, { timestamps: false });
  const acceptedCount = fDocs.filter((f) => f.status === "accepted").length;
  console.log(`✓ Inserted ${fDocs.length} friendships (${acceptedCount} accepted, ${fDocs.length - acceptedCount} pending)`);

  // 16) Conversations + messages (one convo per listing → respects unique index)
  const BUYER_LINES = ["Hi! Is this still available?", "Interested — can you share more photos?", "Would you take a bit less?", "Can I pick it up from your hostel this evening?", "Does it come with the accessories?"];
  const SELLER_LINES = ["Yes, it's available!", "Sure, it's in great condition.", "I can do a small discount.", "Works perfectly, barely used.", "Let me know when you're free."];
  const DM_LINES = ["Hey! Are you going to the session tomorrow?", "Yeah, planning to!", "Let's meet at the library at 5.", "Done, see you there.", "Did you finish the assignment?"];
  let convCount = 0, msgCount = 0;
  const convoInserts = [];
  const msgInserts = [];
  for (const l of pickN(listingRecords, N.listingChats)) {
    const buyer = pickEligible(l.age, l.seller);
    if (!buyer) continue;
    const cAge = l.age * Math.pow(rnd(), 1.4);
    const participants = [String(l.seller), String(buyer._id)].sort();
    const convId = new mongoose.Types.ObjectId();
    const nMsg = rint(2, 6);
    const start = daysAgo(cAge).getTime();
    let last = "", lastAt = new Date(start);
    for (let m = 0; m < nMsg; m++) {
      const fromBuyer = m % 2 === 0;
      const when = new Date(start + m * 12 * 60 * 1000);
      const content = fromBuyer ? pick(BUYER_LINES) : pick(SELLER_LINES);
      msgInserts.push({ conversation: convId, sender: fromBuyer ? buyer._id : l.seller, university: uniId, content, readAt: m === nMsg - 1 && chance(0.4) ? null : new Date(when.getTime() + 60000), createdAt: when, updatedAt: when });
      last = content; lastAt = when;
    }
    convoInserts.push({ _id: convId, listingId: l._id, contextType: "listing", listingTitle: l.title, participants, university: uniId, lastMessage: last, lastMessageAt: lastAt, createdAt: daysAgo(cAge), updatedAt: lastAt });
    convCount++; msgCount += nMsg;
  }
  // Friend DMs on disjoint pairs (a user can be in at most one listingId:null
  // convo). Exclude protected accounts — they may already own a real null-listing
  // conversation, which would collide on the unique {listingId, participants} index.
  const protectedIds = new Set([...(samay ? [String(samay._id)] : []), ...(shanjhi ? [String(shanjhi._id)] : [])]);
  const usedInDM = new Set();
  let dmMade = 0;
  const shuffled = pickN(users.filter((u) => !protectedIds.has(String(u._id))), users.length);
  for (let i = 0; i + 1 < shuffled.length && dmMade < N.friendDMs; i += 2) {
    const a = shuffled[i], b = shuffled[i + 1];
    if (usedInDM.has(String(a._id)) || usedInDM.has(String(b._id))) continue;
    usedInDM.add(String(a._id)); usedInDM.add(String(b._id));
    const cap = Math.min(a.ageDays, b.ageDays);
    const cAge = cap * Math.pow(rnd(), 1.4);
    const participants = [String(a._id), String(b._id)].sort();
    const convId = new mongoose.Types.ObjectId();
    const nMsg = rint(2, 5);
    const start = daysAgo(cAge).getTime();
    let last = "", lastAt = new Date(start);
    for (let m = 0; m < nMsg; m++) {
      const when = new Date(start + m * 30 * 60 * 1000);
      const content = DM_LINES[m % DM_LINES.length];
      msgInserts.push({ conversation: convId, sender: m % 2 === 0 ? a._id : b._id, university: uniId, content, readAt: m === nMsg - 1 && chance(0.4) ? null : new Date(when.getTime() + 90000), createdAt: when, updatedAt: when });
      last = content; lastAt = when;
    }
    convoInserts.push({ _id: convId, listingId: null, contextType: "friend", listingTitle: "", participants, university: uniId, lastMessage: last, lastMessageAt: lastAt, createdAt: daysAgo(cAge), updatedAt: lastAt });
    convCount++; msgCount += nMsg; dmMade++;
  }
  await Conversation.insertMany(convoInserts, { timestamps: false });
  await Message.insertMany(msgInserts, { timestamps: false });
  console.log(`✓ Inserted ${convCount} conversations (${msgCount} messages)`);

  // 17) Academics — records, attendance, timetable
  const acadDocs = [];
  for (const u of pickN(users, N.academics)) {
    const sems = rint(2, 6);
    for (let s = 1; s <= sems; s++) {
      const subjects = pickN(SUBJECTS, rint(4, 6)).map((name) => ({ name, credits: pick([2, 3, 3, 4, 4]), grade: pick(GRADES) }));
      acadDocs.push({ user: u._id, university: uniId, semester: s, subjects, createdAt: daysAgo(u.ageDays * rnd()), updatedAt: daysAgo(u.ageDays * rnd()) });
    }
  }
  await AcademicRecord.insertMany(acadDocs, { timestamps: false });

  const attDocs = [];
  for (const u of pickN(users, N.attendance)) {
    for (const name of pickN(SUBJECTS, rint(3, 6))) {
      const held = rint(20, 45); const attended = Math.round(held * (0.6 + rnd() * 0.35));
      attDocs.push({ user: u._id, university: uniId, name, held, attended, target: 75, createdAt: daysAgo(u.ageDays * rnd()), updatedAt: daysAgo(u.ageDays * rnd()) });
    }
  }
  await AttendanceSubject.insertMany(attDocs, { timestamps: false });

  const SLOTS = [["09:00", "09:55"], ["10:00", "10:55"], ["11:00", "11:55"], ["12:00", "12:55"], ["14:00", "14:55"], ["15:00", "15:55"], ["16:00", "16:55"]];
  const ttDocs = [];
  for (const u of pickN(users, N.timetable)) {
    for (let e = 0; e < rint(4, 6); e++) {
      const slot = pick(SLOTS);
      ttDocs.push({ user: u._id, university: uniId, subject: pick(SUBJECTS).slice(0, 80), dayOfWeek: rint(1, 5), startTime: slot[0], endTime: slot[1], room: `NTB ${rint(101, 305)}`, professor: `Dr. ${pick(LAST)}`, createdAt: daysAgo(u.ageDays * rnd()), updatedAt: daysAgo(u.ageDays * rnd()) });
    }
  }
  await TimetableEntry.insertMany(ttDocs, { timestamps: false });
  console.log(`✓ Inserted ${acadDocs.length} academic records, ${attDocs.length} attendance subjects, ${ttDocs.length} timetable entries`);

  // 18) Device tokens
  const dtDocs = pickN(users, N.deviceTokens).map((u, i) => ({ user: u._id, university: uniId, token: `seed-${i}-${Math.floor(rnd() * 1e9).toString(36)}`, platform: pick(["web", "android", "android", "ios"]), createdAt: daysAgo(u.ageDays * rnd()), updatedAt: daysAgo(u.ageDays * rnd()) }));
  await DeviceToken.insertMany(dtDocs, { timestamps: false });
  console.log(`✓ Inserted ${dtDocs.length} device tokens`);

  // 19) Reports + moderation
  const adminId = samay ? samay._id : users[0]._id;
  const reportDocs = [];
  const reportSeen = new Set();
  let tries = 0;
  while (reportDocs.length < N.reports && tries < N.reports * 6) {
    tries++;
    const target = pick(reportable);
    const reporter = pickEligible(ageOfDate(target.createdAt), target.ownerId);
    if (!reporter) continue;
    const key = `${reporter._id}_${target.type}_${target.id}`;
    if (reportSeen.has(key)) continue;
    reportSeen.add(key);
    const st = pick(["open", "open", "resolved", "resolved", "dismissed"]);
    const rAge = ageOfDate(target.createdAt) * Math.pow(rnd(), 1.2);
    const handled = st !== "open";
    const r = { reporter: reporter._id, university: uniId, targetType: target.type, targetId: target.id, reason: pick(REPORT_REASONS), snapshot: { title: String(target.title).slice(0, 120), content: String(target.content || "").slice(0, 500) }, status: st, createdAt: daysAgo(rAge), updatedAt: daysAgo(rAge) };
    if (handled) { r.handledBy = adminId; r.handledAt = daysAgo(Math.max(0, rAge - rnd())); }
    reportDocs.push(r);
  }
  await Report.insertMany(reportDocs, { timestamps: false });
  const openR = reportDocs.filter((r) => r.status === "open").length;
  console.log(`✓ Inserted ${reportDocs.length} reports (${openR} open)`);

  // strikes + suspensions (managed users only, never protected)
  const managedIds = insertedUsers.map((u) => u._id);
  const strikeTargets = pickN(managedIds, N.strikes);
  const banTargets = pickN(strikeTargets, N.suspended);
  const banSet = new Set(banTargets.map(String));
  const modOps = strikeTargets.map((id) => {
    const banned = banSet.has(String(id));
    return { updateOne: { filter: { _id: id }, update: { $set: { strikes: banned ? rint(3, 4) : rint(1, 2), ...(banned ? { isBanned: true, banReason: pick(BAN_REASONS), bannedAt: daysAgo(rint(1, 30)) } : {}) } } } };
  });
  if (modOps.length) await User.bulkWrite(modOps);
  console.log(`✓ Applied ${strikeTargets.length} strike-sets (${banTargets.length} suspended)`);

  // 20) Notifications (protected admin + a sample of users)
  const samayId = samay ? String(samay._id) : null;
  const notifUserIds = [...(samay ? [samay._id] : []), ...pickN(managedIds, N.notifUsers)];
  const notifDocs = [];
  for (const uid of notifUserIds) {
    const count = String(uid) === samayId ? rint(6, 9) : rint(1, 3);
    for (let i = 0; i < count; i++) {
      const t = pick(NOTIF);
      const d = rint(1, 40);
      notifDocs.push({ user: uid, type: t.type, title: t.title, description: t.description, read: chance(0.55), createdAt: daysAgo(d), updatedAt: daysAgo(d) });
    }
  }
  await Notification.insertMany(notifDocs, { timestamps: false });
  console.log(`✓ Inserted ${notifDocs.length} notifications`);

  // 21) Apply points + badges (incl. milestones) to all seed participants
  const MILE = [{ p: 100, b: "Rising Star" }, { p: 500, b: "Campus Hero" }, { p: 1000, b: "MANIT Legend" }];
  const ptsOps = [];
  for (const u of users) {
    const k = String(u._id);
    const pts = pointsBy.get(k) || 0;
    const badges = new Set(badgesBy.get(k) || []);
    for (const m of MILE) if (pts >= m.p) badges.add(m.b);
    const update = { $set: { points: pts } };
    if (badges.size) update.$addToSet = { badges: { $each: [...badges] } };
    ptsOps.push({ updateOne: { filter: { _id: u._id }, update } });
  }
  if (ptsOps.length) await User.bulkWrite(ptsOps);
  console.log(`✓ Applied points/badges to ${ptsOps.length} users`);

  // 22) Admin model — Samay is the SOLE admin; remove the old CEO ghost account.
  if (samay) {
    await User.updateOne({ _id: samay._id }, { $set: { isAdmin: true } });
    await User.updateMany({ email: { $ne: ADMIN_EMAIL }, isAdmin: true }, { $set: { isAdmin: false } });
  }
  const ghost = await User.deleteOne({ email: CEO_GHOST_EMAIL });
  console.log(`✓ Admin: ${ADMIN_EMAIL} is sole admin${ghost.deletedCount ? "; removed old CEO account" : ""}`);

  // Protected profile refresh (never touches password/createdAt).
  if (shanjhi) { shanjhi.displayName = "Shanjhi Jain"; shanjhi.bio = "CSE '25. Loves audio gear and clean code."; await shanjhi.save(); }

  await mongoose.disconnect();

  const totalUsers = insertedUsers.length + (samay ? 1 : 0) + (shanjhi ? 1 : 0);
  console.log(`\n✓ Seed complete — ~${totalUsers} users across the last ${WINDOW} days (rising signup curve).`);
  console.log(`  Managed accounts share the password: ${DEMO_PASSWORD}`);
  console.log(`  Admin: log in NORMALLY as ${ADMIN_EMAIL} (Samay's own password) → CEO console.`);
}

run().catch(async (err) => {
  console.error("✗ Seed failed:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
