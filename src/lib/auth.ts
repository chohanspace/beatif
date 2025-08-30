import { getUser, saveUser } from './firebase';
import { sendOtpEmail } from './email';

export async function requestLogin(email: string): Promise<{ success: boolean; message: string }> {
  try {
    let user = await getUser(email);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    if (user) {
      user.otp = otp;
      user.otpExpires = otpExpires;
    } else {
      user = {
        id: email,
        email,
        otp,
        otpExpires,
        createdAt: Date.now(),
      };
    }

    await saveUser(user);
    await sendOtpEmail(email, otp);

    return { success: true, message: 'OTP sent to your email.' };
  } catch (error) {
    console.error('Error requesting login:', error);
    return { success: false, message: 'Failed to send OTP. Please try again.' };
  }
}

export async function verifyOtp(email: string, otp: string): Promise<{ success: boolean; message: string; user?: any }> {
  try {
    const user = await getUser(email);

    if (!user || !user.otp || !user.otpExpires) {
      return { success: false, message: 'No OTP request found for this email.' };
    }

    if (user.otpExpires < Date.now()) {
      return { success: false, message: 'OTP has expired. Please request a new one.' };
    }

    if (user.otp !== otp) {
      return { success: false, message: 'Invalid OTP.' };
    }

    // Clear OTP after successful login
    user.otp = undefined;
    user.otpExpires = undefined;
    await saveUser(user);
    
    // In a real app, you'd create a session token here.
    // For simplicity, we'll store the logged in user email in local storage on the client.
    return { success: true, message: 'Login successful.', user: { email: user.email } };

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, message: 'An error occurred during verification.' };
  }
}
