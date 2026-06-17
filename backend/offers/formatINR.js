// Shared by offers/createOffer.js and offers/updateOffer.js.
const formatINR = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

module.exports = formatINR;
