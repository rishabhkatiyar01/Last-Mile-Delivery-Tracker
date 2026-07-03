const nodemailer = require('nodemailer');
const transporter = require('../config/mailer');
const env = require('../config/env');
const User = require('../models/User');

const emailTemplates = {
  ASSIGNED: (order) => ({
    subject: `Order ${order.orderNumber} Assigned to Agent`,
    html: `<p>Hi there,</p><p>Your order <b>${order.orderNumber}</b> has been assigned to a delivery agent and will be picked up soon.</p>`,
  }),
  PICKED_UP: (order) => ({
    subject: `Order ${order.orderNumber} Picked Up`,
    html: `<p>Your order <b>${order.orderNumber}</b> has been picked up.</p>`,
  }),
  IN_TRANSIT: (order) => ({
    subject: `Order ${order.orderNumber} In Transit`,
    html: `<p>Your order <b>${order.orderNumber}</b> is on its way!</p>`,
  }),
  OUT_FOR_DELIVERY: (order) => ({
    subject: `Order ${order.orderNumber} Out for Delivery`,
    html: `<p>Your order <b>${order.orderNumber}</b> is out for delivery today!</p>`,
  }),
  DELIVERED: (order) => ({
    subject: `Order ${order.orderNumber} Delivered`,
    html: `<p>Your order <b>${order.orderNumber}</b> has been successfully delivered.</p>`,
  }),
  FAILED: (order) => ({
    subject: `Delivery Failed for Order ${order.orderNumber}`,
    html: `<p>Unfortunately, delivery failed for your order <b>${order.orderNumber}</b>. Reason: ${order.failureReason || 'Not specified'}. Please login to reschedule.</p>`,
  }),
  RESCHEDULED: (order) => ({
    subject: `Order ${order.orderNumber} Rescheduled`,
    html: `<p>Your order <b>${order.orderNumber}</b> has been rescheduled for ${order.rescheduledDate}.</p>`,
  }),
};

async function notify(order, status) {
  try {
    const customer = await User.findById(order.customer);
    if (!customer || !customer.email) return;

    const templateFn = emailTemplates[status];
    if (!templateFn) return; // No template for this status

    const template = templateFn(order);

    await transporter.sendMail({
      from: env.smtp.from,
      to: customer.email,
      subject: template.subject,
      html: template.html,
    });
    
    console.log(`Notification sent to ${customer.email} for order ${order.orderNumber} (Status: ${status})`);
  } catch (error) {
    console.error(`Failed to send email for order ${order.orderNumber}:`, error.message);
    // Note: Wrapping in try-catch so failure doesn't block order creation/updates
  }
}

module.exports = { notify };
