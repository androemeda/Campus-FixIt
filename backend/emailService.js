const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'CampusFixIt <admin@canteeno.in>', // or your custom domain
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw new Error(error.message);
    }

    console.log('✅ Email sent successfully to:', to);
    return data;
  } catch (err) {
    console.error('Email service error:', err);
    throw err;
  }
};

module.exports = sendEmail;
