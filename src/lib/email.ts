
"use server";

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function getEmailHtml(title: string, heading: string, body: string, footerText: string) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
            body {
                font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                margin: 0;
                padding: 0;
                background-color: #f0f2f5;
                color: #333;
            }
            .email-container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.07);
                border: 1px solid #e9ecef;
            }
            .header {
                background-image: linear-gradient(to right, hsl(120, 60%, 45%), hsl(120, 70%, 55%));
                color: #ffffff;
                padding: 40px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 36px;
                font-weight: 700;
                letter-spacing: -1px;
            }
            .content {
                padding: 40px 30px;
                text-align: center;
                line-height: 1.7;
            }
            .content h2 {
                font-size: 24px;
                color: hsl(120, 60%, 35%);
                margin-bottom: 20px;
            }
            .content p {
                font-size: 18px;
                margin: 0 0 24px;
                color: #555;
            }
            .otp-code {
                font-family: 'monospace';
                font-size: 42px;
                font-weight: 700;
                letter-spacing: 10px;
                color: hsl(120, 60%, 35%);
                background-color: hsl(120, 60%, 95%);
                padding: 20px 30px;
                border-radius: 12px;
                margin: 20px auto 30px;
                display: inline-block;
                border: 2px dashed hsl(120, 60%, 80%);
            }
            .info {
                font-size: 14px;
                color: #888;
            }
            .footer {
                background-color: #f8f9fa;
                padding: 25px;
                text-align: center;
                font-size: 14px;
                color: #888;
                border-top: 1px solid #e9ecef;
            }
            .footer p {
                margin: 0;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>Beatif</h1>
            </div>
            <div class="content">
                <h2>${heading}</h2>
                ${body}
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Beatif. All rights reserved.</p>
                <p>${footerText}</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

async function sendEmail(to: string, subject: string, html: string) {
    if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
        console.warn(`Email not sent to ${to} because GMAIL_EMAIL or GMAIL_APP_PASSWORD is not set.`);
        return;
    }
    try {
        const mailOptions = {
            from: `"Beatif" <${process.env.GMAIL_EMAIL}>`,
            to,
            subject,
            html,
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
        // In a real app, you might want to throw this error 
        // or handle it more gracefully.
    }
}

export async function sendOtpEmail(to: string, otp: string) {
  const title = `Your Beatif Verification Code: ${otp}`;
  const heading = "Verify Your Email";
  const body = `
    <p>Your one-time password is below.</p>
    <div class="otp-code">${otp}</div>
    <p class="info">This code will expire in 10 minutes. If you did not request this, you can safely ignore this email.</p>
  `;
  const footer = "This email was sent to help you create or verify your Beatif account.";
  const html = getEmailHtml(title, heading, body, footer);
  await sendEmail(to, title, html);
}

export async function sendPasswordResetEmail(to: string, otp: string) {
  const title = `Your Beatif Password Reset Code: ${otp}`;
  const heading = "Reset Your Password";
  const body = `
    <p>You requested a password reset. Use the one-time code below to proceed.</p>
    <div class="otp-code">${otp}</div>
    <p class="info">This code will expire in 10 minutes. If you did not request this, you can safely ignore this email and your password will not be changed.</p>
  `;
  const footer = "This email was sent in response to a password reset request.";
  const html = getEmailHtml(title, heading, body, footer);
  await sendEmail(to, title, html);
}

export async function sendWelcomeEmail(to: string) {
  const title = "Welcome to Beatif!";
  const heading = "Welcome Aboard!";
  const body = `
    <p>Thank you for signing up for Beatif. We're excited to have you!</p>
    <p>You can now log in to your account and start discovering new music.</p>
  `;
  const footer = "You're receiving this email because you just signed up for Beatif.";
  const html = getEmailHtml(title, heading, body, footer);
  await sendEmail(to, title, html);
}

export async function sendPasswordResetSuccessEmail(to: string) {
  const title = "Your Password Has Been Changed";
  const heading = "Password Updated Successfully";
  const body = `
    <p>This email confirms that the password for your Beatif account has been changed.</p>
    <p>If you did not make this change, please contact our support team immediately.</p>
  `;
  const footer = "You're receiving this email because of a recent password change on your account.";
  const html = getEmailHtml(title, heading, body, footer);
  await sendEmail(to, title, html);
}

export async function sendSuccessfulLoginEmail(to: string) {
  const title = "Successful Sign In to Beatif";
  const heading = "New Login to Your Account";
  const body = `
    <p>We've detected a new sign-in to your Beatif account.</p>
    <p class="info">If this wasn't you, please reset your password immediately and contact support.</p>
  `;
  const footer = "This email is a security notification for your Beatif account.";
  const html = getEmailHtml(title, heading, body, footer);
  await sendEmail(to, title, html);
}
