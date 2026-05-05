const nodemailer = require("nodemailer");

/**
 * Configure Nodemailer transporter with IPv4 force (fix for Render ENETUNREACH)
 */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  family: 4,     // 🔥 FORCE IPv4 - Critical for Render compatibility
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Helps with some network environments
  }
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Connection Error:", error.message);
  } else {
    console.log("✅ SMTP Server is ready to send emails (IPv4 Forced)");
  }
});

/**
 * Send an email
 * @param {Object} options - to, subject, html
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"SECE SmartClass" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log("✅ Email dispatched:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Email dispatch failed:", error.message);
    // Don't throw error here to prevent blocking main flow, 
    // but log it for debugging
    return null;
  }
};

module.exports = { sendEmail };
