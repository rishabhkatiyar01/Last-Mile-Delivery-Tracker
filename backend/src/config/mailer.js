const nodemailer = require('nodemailer');
const env = require('./env');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or configured SMTP
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

module.exports = transporter;
