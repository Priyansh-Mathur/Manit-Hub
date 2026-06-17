const University = require("../models/University");

// Shared helper (formerly universities.controller.resolveUniversityByEmail):
// resolve (or lazily create) a University from an email domain.
async function resolveUniversityByEmail(email) {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) {
    throw new Error("Invalid email");
  }

  let university = await University.findOne({
    domains: domain,
  });

  if (!university) {
    university = await University.create({
      name: domain.split(".")[0].toUpperCase(),
      domains: [domain],
    });
  }

  return university;
}

module.exports = { resolveUniversityByEmail };
