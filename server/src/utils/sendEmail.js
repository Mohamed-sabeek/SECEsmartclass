const { Resend } = require('resend');

/**
 * Initialize Resend client
 * Uses API-based delivery to bypass cloud SMTP restrictions (ENETUNREACH)
 */
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email using Resend API
 * @param {Object} options - to, subject, html
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'SECE SmartClass <onboarding@resend.dev>',
      to,
      subject,
      html
    });

    if (error) {
      console.error("❌ Resend API Error:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("❌ Resend Dispatch Failed:", error.message);
    return null;
  }
};

module.exports = { sendEmail };
