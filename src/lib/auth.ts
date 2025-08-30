
"use server";

import { getUser, saveUser } from './firebase';
import { sendOtpEmail, sendPasswordResetEmail } from './email';
import type { User } from './types';
import { randomInt } from 'crypto';

// Placeholder for password hashing. In a real app, use a strong library like bcrypt.
async function hashPassword(password: string): Promise<string> {
    // This is NOT secure. For demonstration purposes only.
    return `hashed_${password}`;
}

// Placeholder for password verification.
async function verifyPassword(password: string, hash: string): Promise<boolean> {
    // This is NOT secure. For demonstration purposes only.
    return `hashed_${password}` === hash;
}

function generateOtp(): string {
    return randomInt(100000, 999999).toString();
}

export async function signUp(email: string, password: string): Promise<{ success: boolean; message: string }> {
  try {
    const existingUser = await getUser(email);
    if (existingUser && existingUser.isVerified) {
        return { success: false, message: 'An account with this email already exists and is verified.' };
    }
    
    if (existingUser && !existingUser.isVerified) {
        // Resend OTP for unverified user trying to sign up again
        const otp = generateOtp();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await saveUser({ ...existingUser, otp, otpExpires });
        await sendOtpEmail(email, otp);
        return { success: true, message: 'A new verification code has been sent. Please check your email.' };
    }

    const hashedPassword = await hashPassword(password);
    const otp = generateOtp();
    const newUser: User = {
        id: email, 
        email,
        password: hashedPassword,
        createdAt: Date.now(),
        isVerified: false,
        otp,
        otpExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
    };
    
    await saveUser(newUser);
    await sendOtpEmail(email, otp);

    return { success: true, message: 'Account created! Please check your email for the verification code.' };
  } catch (error) {
    console.error('Error during sign up:', error);
    return { success: false, message: 'Failed to create account. Please try again.' };
  }
}

export async function verifyOtp(email: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
        const user = await getUser(email);
        if (!user || !user.otp || !user.otpExpires) {
            return { success: false, message: 'No OTP request found for this email. Please sign up again.' };
        }

        if (user.otpExpires < Date.now()) {
            return { success: false, message: 'Your OTP has expired. Please request a new one.' };
        }

        if (user.otp !== otp) {
            return { success: false, message: 'Invalid OTP. Please try again.' };
        }

        const verifiedUser: User = { ...user, isVerified: true, otp: undefined, otpExpires: undefined };
        await saveUser(verifiedUser);

        return { success: true, message: 'Email verified successfully! You can now log in.' };
    } catch(error) {
        console.error('Error during OTP verification:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function resendVerificationOtp(email: string): Promise<{ success: boolean; message: string }> {
    try {
        const user = await getUser(email);
        if (!user) {
            return { success: false, message: "No account found with this email." };
        }
        if (user.isVerified) {
            return { success: false, message: "This account is already verified."};
        }

        const otp = generateOtp();
        const otpExpires = Date.now() + 10 * 60 * 1000;
        await saveUser({ ...user, otp, otpExpires });
        await sendOtpEmail(email, otp);

        return { success: true, message: 'A new verification code has been sent.' };

    } catch (error) {
        console.error('Error resending OTP:', error);
        return { success: false, message: 'Failed to resend OTP.' };
    }
}

export async function login(email: string, password: string): Promise<{ success: boolean; message: string; user?: Omit<User, 'password' | 'otp' | 'otpExpires'>, requiresVerification?: boolean }> {
  try {
    const user = await getUser(email);

    if (!user || !user.password) {
      return { success: false, message: 'Invalid email or password.' };
    }
    
    if (!user.isVerified) {
        return { success: false, message: 'Account not verified.', requiresVerification: true };
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return { success: false, message: 'Invalid email or password.' };
    }

    // Return user object without sensitive info
    const { password: _password, otp: _otp, otpExpires: _otpExpires, ...userToReturn } = user;

    return { success: true, message: 'Login successful.', user: userToReturn };

  } catch (error) {
    console.error('Error during login:', error);
    return { success: false, message: 'An error occurred during login.' };
  }
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean, message: string }> {
    try {
        const user = await getUser(email);
        if (!user) {
            // Still return success to prevent email enumeration
            return { success: true, message: "If an account with that email exists, a password reset link has been sent." };
        }

        const otp = generateOtp();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        
        await saveUser({ ...user, otp, otpExpires });
        await sendPasswordResetEmail(email, otp);

        return { success: true, message: "If an account with that email exists, a password reset link has been sent." };
    } catch (error) {
        console.error("Error requesting password reset:", error);
        return { success: false, message: "An unexpected error occurred." };
    }
}


export async function resetPasswordWithOtp(email: string, otp: string, newPassword: string): Promise<{ success: boolean, message: string }> {
    try {
        const user = await getUser(email);
        if (!user || !user.otp || !user.otpExpires) {
            return { success: false, message: 'Invalid or expired password reset request.' };
        }
        if (user.otpExpires < Date.now()) {
            return { success: false, message: 'Your OTP has expired. Please request a new one.' };
        }
        if (user.otp !== otp) {
            return { success: false, message: 'Invalid OTP. Please try again.' };
        }

        const hashedPassword = await hashPassword(newPassword);
        const updatedUser: User = { 
            ...user, 
            password: hashedPassword, 
            otp: undefined, 
            otpExpires: undefined 
        };
        await saveUser(updatedUser);

        return { success: true, message: 'Password has been reset successfully. You can now log in.' };
    } catch (error) {
        console.error("Error resetting password:", error);
        return { success: false, message: "An unexpected error occurred." };
    }
}
