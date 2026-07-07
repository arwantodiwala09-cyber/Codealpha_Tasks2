const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(message);
};

// Email templates
const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to E-Commerce!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to E-Commerce!</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Hi ${name},</h2>
          <p>Thank you for creating an account! We're excited to have you on board.</p>
          <p>Start exploring our vast collection of products and enjoy exclusive deals.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
              Start Shopping
            </a>
          </div>
        </div>
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>&copy; 2024 E-Commerce. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  verifyEmail: (name, token) => ({
    subject: 'Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">Email Verification</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Hi ${name},</h2>
          <p>Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/verify-email/${token}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
              Verify Email
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
        </div>
      </div>
    `,
  }),

  resetPassword: (name, token) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">Reset Password</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Hi ${name},</h2>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/reset-password/${token}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
  }),

  orderConfirmation: (name, order) => ({
    subject: `Order Confirmed - #${order._id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">Order Confirmed!</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Thank you ${name}!</h2>
          <p>Your order has been placed successfully.</p>
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Order Summary</h3>
            <p><strong>Order ID:</strong> #${order._id}</p>
            <p><strong>Total:</strong> ₹${order.totalPrice}</p>
            <p><strong>Payment:</strong> ${order.paymentInfo.method}</p>
          </div>
          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/orders/${order._id}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
              View Order
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  otpEmail: (name, otp) => ({
    subject: 'Your OTP for Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">OTP Verification</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Hi ${name},</h2>
          <p>Your OTP for verification is:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #667eea;">${otp}</div>
          </div>
          <p style="color: #666; font-size: 14px;">This OTP will expire in ${process.env.OTP_EXPIRE} minutes.</p>
        </div>
      </div>
    `,
  }),
};

module.exports = { sendEmail, emailTemplates };