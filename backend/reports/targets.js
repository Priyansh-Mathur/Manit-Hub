// Shared by reports/createReport.js and reports/handleReport.js.
// How each reportable type is loaded, summarized and (if needed) removed.
const TARGETS = {
  listing: {
    model: () => require("../models/Listing"),
    snapshot: (doc) => ({ title: doc.title, content: doc.description }),
    remove: (doc) => (doc.isActive = false),
  },
  document: {
    model: () => require("../models/Document"),
    snapshot: (doc) => ({ title: doc.title, content: doc.description }),
    remove: (doc) => (doc.isActive = false),
  },
  confession: {
    model: () => require("../models/Confession"),
    snapshot: (doc) => ({ title: "Confession", content: doc.content }),
    remove: (doc) => (doc.isHidden = true),
  },
  question: {
    model: () => require("../models/Question"),
    snapshot: (doc) => ({ title: doc.title, content: doc.body }),
    remove: (doc) => (doc.isActive = false),
  },
  answer: {
    model: () => require("../models/Answer"),
    snapshot: (doc) => ({ title: "Answer", content: doc.body }),
    remove: (doc) => (doc.isActive = false),
  },
  lostfound: {
    model: () => require("../models/LostFoundItem"),
    snapshot: (doc) => ({ title: doc.title, content: doc.description }),
    remove: (doc) => (doc.isActive = false),
  },
  ride: {
    model: () => require("../models/Ride"),
    snapshot: (doc) => ({ title: `${doc.from} → ${doc.to}`, content: doc.note }),
    remove: (doc) => (doc.isActive = false),
  },
  event: {
    model: () => require("../models/Event"),
    snapshot: (doc) => ({ title: doc.title, content: doc.description }),
    remove: (doc) => (doc.isActive = false),
  },
};

module.exports = TARGETS;
