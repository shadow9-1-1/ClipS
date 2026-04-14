const nodemailer = require('nodemailer');

let transporter;
let warnedAboutConfig = false;

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    if (!warnedAboutConfig) {
      console.warn('Email is disabled: SMTP_HOST, SMTP_USER, and SMTP_PASS are required.');
      warnedAboutConfig = true;
    }
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user,
      pass,
    },
  });

  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const activeTransporter = getTransporter();

  if (!activeTransporter) {
    return { sent: false, reason: 'smtp_not_configured' };
  }

  const from = process.env.SMTP_FROM || 'ClipS <no-reply@clips.local>';
  const info = await activeTransporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  return {
    sent: true,
    messageId: info.messageId,
  };
};

module.exports = {
  sendEmail,
};
