const nodemailer = require("nodemailer");

// Outbound email (password reset + signup verification).
// Configured entirely via env — when SMTP_* vars are absent the app runs
// exactly as before (no verification emails, dev-mode reset tokens).
//
//   SMTP_HOST   e.g. smtp.gmail.com
//   SMTP_PORT   e.g. 465 (implicit TLS) or 587 (STARTTLS)
//   SMTP_USER   SMTP username (for Gmail: the address)
//   SMTP_PASS   SMTP password (for Gmail: an App Password)
//   EMAIL_FROM  optional From header; defaults to SMTP_USER

const isEmailConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

const sendMail = async ({ to, subject, text }) => {
  if (!isEmailConfigured()) {
    throw new Error("Email is not configured (missing SMTP_* env vars)");
  }
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  });
};

module.exports = { isEmailConfigured, sendMail };
