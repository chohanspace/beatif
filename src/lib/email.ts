
"use server";

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function getOtpEmailHtml(otp: string) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Beatif Login Code</title>
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
                <p>Your one-time password is below.</p>
                <div class="otp-code">${otp}</div>
                <p class="info">This code will expire in 10 minutes. If you did not request this, you can safely ignore this email.</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Beatif. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}


function getWelcomeEmailHtml(email: string) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Beatif!</title>
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
            }
            .content p {
                font-size: 18px;
                margin: 0 0 24px;
                color: #555;
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
                <h2>Welcome, ${email}!</h2>
                <p>Your account has been successfully created. You can now log in using your email address to receive a one-time password.</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Beatif. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

export async function sendOtpEmail(to: string, otp: string) {
  try {
    const mailOptions = {
        from: `"Beatif" <${process.env.GMAIL_EMAIL}>`,
        to,
        subject: `Your Beatif Login Code: ${otp}`,
        text: `Your one-time password is: ${otp}`,
        html: getOtpEmailHtml(otp),
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    // In a real app, you might want to throw this error 
    // or handle it more gracefully.
  }
}

export async function sendWelcomeEmail(to: string) {
  try {
    const mailOptions = {
        from: `"Beatif" <${process.env.GMAIL_EMAIL}>`,
        to,
        subject: `Welcome to Beatif!`,
        text: `Welcome to Beatif! Your account has been created.`,
        html: getWelcomeEmailHtml(to),
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
}
