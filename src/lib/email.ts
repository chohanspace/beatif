import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOtpEmail(to: string, otp: string) {
  const mailOptions = {
    from: process.env.GMAIL_EMAIL,
    to,
    subject: 'Your Beatif Login Code',
    text: `Your one-time password is: ${otp}`,
    html: `<b>Your one-time password is: ${otp}</b>`,
  };

  await transporter.sendMail(mailOptions);
}
