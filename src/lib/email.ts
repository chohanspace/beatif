
"use server";

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function getEmailHtml(otp: string) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Beatif Login Code</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                margin: 0;
                padding: 0;
                background-color: #f4f4f7;
                color: #333;
            }
            .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 6px 20px rgba(0,0,0,0.08);
            }
            .header {
                background-color: hsl(240 10% 3.9%);
                color: #ffffff;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                color: hsl(120 60% 50%);
            }
            .content {
                padding: 40px;
                text-align: center;
                line-height: 1.6;
            }
            .content p {
                font-size: 18px;
                margin: 0 0 20px;
            }
            .otp-code {
                display: inline-block;
                font-size: 36px;
                font-weight: 700;
                letter-spacing: 8px;
                color: hsl(120 60% 45%);
                background-color: #e8f5e9;
                padding: 15px 25px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .footer {
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                font-size: 14px;
                color: #6c757d;
            }
            .footer p {
                margin: 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Beatif</h1>
            </div>
            <div class="content">
                <p>Here is your one-time password to log in to your account.</p>
                <div class="otp-code">${otp}</div>
                <p>This code will expire in 10 minutes. Please do not share it with anyone.</p>
            </div>
            <div class="footer">
                <p>If you did not request this, you can safely ignore this email.</p>
                <p>&copy; ${new Date().getFullYear()} Beatif. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

export async function sendOtpEmail(to: string, otp: string) {
  const mailOptions = {
    from: `"Beatif" <${process.env.GMAIL_EMAIL}>`,
    to,
    subject: 'Your Beatif Login Code',
    text: `Your one-time password is: ${otp}`,
    html: getEmailHtml(otp),
  };

  await transporter.sendMail(mailOptions);
}
