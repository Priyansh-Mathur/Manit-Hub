// Full snapshot backup of specific accounts (user doc + every record that
// references that user across all collections). Robust: it discovers User
// references from each schema instead of hardcoding field names.
//
// Usage:  cd backend && node scripts/backupAccounts.js
// Output: backend/backups/<scholarId>.json  (one file per account, overwritten)
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const EMAILS = ["2311401212@stu.manit.ac.in", "2311401213@stu.manit.ac.in"];
const BACKUP_DIR = path.join(__dirname, "..", "backups");

// Load every model so mongoose registers them all.
const modelsDir = path.join(__dirname, "..", "models");
for (const f of fs.readdirSync(modelsDir)) {
  if (f.endsWith(".js")) require(path.join(modelsDir, f));
}

// Fields in a schema that reference the User model (single ref or array of refs).
function userRefPaths(schema) {
  const refs = [];
  schema.eachPath((name, type) => {
    if (type.options && type.options.ref === "User") refs.push(name);
    else if (
      type.instance === "Array" &&
      type.caster &&
      type.caster.options &&
      type.caster.options.ref === "User"
    ) {
      refs.push(name);
    }
  });
  return refs;
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const User = mongoose.model("User");

  for (const email of EMAILS) {
    const user = await User.findOne({ email })
      .select(
        "+password +tokenVersion +passwordResetToken +passwordResetExpires +emailVerificationToken +emailVerificationExpires"
      )
      .lean();

    if (!user) {
      console.log(`!! No account for ${email} — skipped`);
      continue;
    }

    const id = user._id;
    const snapshot = {
      backedUpAt: new Date().toISOString(),
      email,
      userId: String(id),
      user,
      related: {},
    };

    let relatedCount = 0;
    for (const modelName of mongoose.modelNames()) {
      if (modelName === "User") continue;
      const Model = mongoose.model(modelName);
      const refs = userRefPaths(Model.schema);
      if (!refs.length) continue;
      const or = refs.map((f) => ({ [f]: id }));
      const docs = await Model.find({ $or: or }).lean();
      if (docs.length) {
        snapshot.related[modelName] = docs;
        relatedCount += docs.length;
      }
    }

    const file = path.join(BACKUP_DIR, `${email.split("@")[0]}.json`);
    fs.writeFileSync(file, JSON.stringify(snapshot, null, 2));
    const summary = Object.entries(snapshot.related)
      .map(([m, arr]) => `${m}:${arr.length}`)
      .join(", ");
    console.log(
      `OK ${email} -> ${user.displayName} | ${relatedCount} related docs [${summary || "none"}]`
    );
    console.log(`   saved: ${file}`);
  }

  await mongoose.disconnect();
  console.log("\nDone.");
})().catch((e) => {
  console.error("Backup failed:", e);
  process.exit(1);
});
