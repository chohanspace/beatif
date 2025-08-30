
"use server";

import { getUser, saveUser } from './firebase';
import { sendOtpEmail } from './email';
import type { User } from './types';

export async function requestLogin(email: string): Promise<{ success: boolean; message: string }> {
  try {
    let user = await getUser(email);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    if (user) {
      // If user exists, just update OTP fields
      user.otp = otp;
      user.otpExpires = otpExpires;
    } else {
      // If user is new, create the full user object
      user = {
        id: email, // The document ID will be the user's email
        email,
        otp,
        otpExpires,
        createdAt: Date.now(),
      };
    }

    // Save the user object. `saveUser` should use user.id as the document key.
    await saveUser(user);
    await sendOtpEmail(email, otp);

    return { success: true, message: 'OTP sent to your email.' };
  } catch (error) {
    console.error('Error requesting login:', error);
    return { success: false, message: 'Failed to send OTP. Please try again.' };
  }
}

export async function verifyOtp(email: string, otp: string): Promise<{ success: boolean; message: string; user?: Omit<User, 'otp' | 'otpExpires'> }> {
  try {
    const user = await getUser(email);

    if (!user || !user.otp || !user.otpExpires) {
      return { success: false, message: 'No OTP request found for this email. Please request a new one.' };
    }

    if (user.otpExpires < Date.now()) {
      return { success: false, message: 'OTP has expired. Please request a new one.' };
    }

    if (user.otp !== otp) {
      return { success: false, message: 'Invalid OTP.' };
    }

    // Clear OTP after successful login
    const loggedInUser: User = { ...user };
    delete loggedInUser.otp;
    delete loggedInUser.otpExpires;
    
    // Save the user object again to clear OTP from the database
    await saveUser(loggedInUser);
    
    // Return user object without sensitive OTP info
    const { otp: _otp, otpExpires: _otpExpires, ...userToReturn } = loggedInUser;

    return { success: true, message: 'Login successful.', user: userToReturn };

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, message: 'An error occurred during verification.' };
  }
}
