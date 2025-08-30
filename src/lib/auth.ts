
"use server";

import { getUser, saveUser } from './firebase';
import { sendOtpEmail, sendWelcomeEmail } from './email';
import type { User } from './types';

// Placeholder for password hashing. In a real app, use a strong library like bcrypt.
async function hashPassword(password: string): Promise<string> {
    // This is NOT secure. For demonstration purposes only.
    return `hashed_${password}`;
}

export async function signUp(email: string, password: string): Promise<{ success: boolean; message: string }> {
  try {
    const existingUser = await getUser(email);
    if (existingUser) {
        return { success: false, message: 'An account with this email already exists.' };
    }

    const hashedPassword = await hashPassword(password);
    const newUser: User = {
        id: email, // The document ID will be the user's email
        email,
        password_placeholder: hashedPassword,
        createdAt: Date.now(),
    };
    
    await saveUser(newUser);
    await sendWelcomeEmail(email);

    return { success: true, message: 'Account created successfully! Please check your email to log in.' };
  } catch (error) {
    console.error('Error during sign up:', error);
    return { success: false, message: 'Failed to create account. Please try again.' };
  }
}

export async function requestLogin(email: string): Promise<{ success: boolean; message: string }> {
  try {
    let user = await getUser(email);
    if (!user) {
        return { success: false, message: 'No account found with this email. Please sign up first.' };
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    
    await saveUser(user);
    await sendOtpEmail(email, otp);

    return { success: true, message: 'OTP sent to your email.' };
  } catch (error) {
    console.error('Error requesting login:', error);
    return { success: false, message: 'Failed to send OTP. Please try again.' };
  }
}

export async function verifyOtp(email: string, otp: string): Promise<{ success: boolean; message: string; user?: Omit<User, 'otp' | 'otpExpires' | 'password_placeholder'> }> {
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
    
    // Return user object without sensitive info
    const { otp: _otp, otpExpires: _otpExpires, password_placeholder, ...userToReturn } = loggedInUser;

    return { success: true, message: 'Login successful.', user: userToReturn as any };

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, message: 'An error occurred during verification.' };
  }
}
