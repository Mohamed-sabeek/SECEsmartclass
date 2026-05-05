const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send an email
 * @param {Object} options - to, subject, html
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    return await transporter.sendMail({
      from: `"SECE SmartClass" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error("NODEMAILER ERROR:", error.message);
    throw error;
  }
};

module.exports = { sendEmail };
