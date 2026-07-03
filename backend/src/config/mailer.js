const nodemailer = require('nodemailer');
const env = require('./env');

const isPlaceholder = !env.smtp.user || 
  env.smtp.user === 'your_email@gmail.com' || 
  env.smtp.user === 'test@gmail.com';

let transporter;

if (isPlaceholder) {
  console.log('SMTP service is not configured (using placeholder credentials). Email notifications will be mock-sent.');
  // Create a mock transporter
  transporter = {
    sendMail: async (options) => {
      console.log(`[Mock Email] To: ${options.to}, Subject: ${options.subject}`);
      return { messageId: 'mock-id' };
    }
  };
} else {
  transporter = nodemailer.createTransport({
    service: 'gmail', // or configured SMTP
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });

  // Verify connection configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.error('SMTP Connection Error:', error.message);
    } else {
      console.log('SMTP Server is ready to send messages');
    }
  });
}

module.exports = transporter;

