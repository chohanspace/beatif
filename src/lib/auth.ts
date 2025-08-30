
"use server";

import clientPromise from './mongodb';
import { sendOtpEmail, sendPasswordResetEmail } from './email';
import type { User } from './types';
import { randomInt } from 'crypto';
import type { Collection, Document, WithId } from 'mongodb';

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

async function getUsersCollection(): Promise<Collection<Document>> {
    const client = await clientPromise;
    const db = client.db();
    return db.collection('users');
}

export async function signUp(email: string, password: string): Promise<{ success: boolean; message: string; requiresVerification?: boolean }> {
  try {
    const users = await getUsersCollection();
    const existingUser = (await users.findOne({ email })) as User | null;
    const otp = generateOtp();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    if (existingUser) {
      if (existingUser.isVerified) {
        return { success: false, message: 'An account with this email already exists.' };
      }
      // If user exists but is not verified, update OTP and resend
      await users.updateOne({ email }, { $set: { otp, otpExpires, password: await hashPassword(password) } });
      await sendOtpEmail(email, otp);
      return { success: true, message: 'A new verification code has been sent to your email.', requiresVerification: true };
    }

    const hashedPassword = await hashPassword(password);
    const userToSave: User = {
      id: email, 
      email,
      password: hashedPassword,
      createdAt: Date.now(),
      isVerified: false,
      otp,
      otpExpires
    };
    
    await users.insertOne(userToSave);
    await sendOtpEmail(email, otp);

    return { success: true, message: 'Account created. Please check your email for a verification code.', requiresVerification: true };
  } catch (error) {
    console.error('Error during sign up:', error);
    return { success: false, message: 'Failed to create account. Please try again.' };
  }
}

export async function verifyOtp(email: string, otp: string): Promise<{ success: boolean, message: string }> {
    try {
        const users = await getUsersCollection();
        const user = (await users.findOne({ email })) as User | null;

        if (!user || !user.otp || !user.otpExpires) {
            return { success: false, message: 'No OTP request found for this email. Please sign up again.' };
        }
        if (user.otpExpires < Date.now()) {
            return { success: false, message: 'Your OTP has expired. Please request a new one.' };
        }
        if (user.otp !== otp) {
            return { success: false, message: 'Invalid OTP. Please try again.' };
        }
        
        await users.updateOne({ email }, { $set: { isVerified: true, otp: undefined, otpExpires: undefined } });

        return { success: true, message: 'Email verified successfully! You can now log in.' };
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return { success: false, message: "An unexpected error occurred during verification." };
    }
}


export async function login(email: string, password: string): Promise<{ success: boolean; message: string; user?: Omit<User, 'password' | 'otp' | 'otpExpires'>, requiresVerification?: boolean }> {
  try {
    const users = await getUsersCollection();
    const userDoc = (await users.findOne({ email })) as WithId<User> | null;

    if (!userDoc || !userDoc.password) {
      return { success: false, message: 'Invalid email or password.' };
    }
    
    const isPasswordValid = await verifyPassword(password, userDoc.password);

    if (!isPasswordValid) {
      return { success: false, message: 'Invalid email or password.' };
    }
    
    if (!userDoc.isVerified) {
        await resendSignUpOtp(email);
        return { success: false, message: 'Account not verified. A new verification code has been sent to your email.', requiresVerification: true };
    }

    const { password: _password, otp: _otp, otpExpires: _otpExpires, _id, ...userToReturn } = userDoc;

    return { success: true, message: 'Login successful.', user: { ...userToReturn, id: _id.toString() } };

  } catch (error) {
    console.error('Error during login:', error);
    return { success: false, message: 'An error occurred during login.' };
  }
}

export async function resendSignUpOtp(email: string): Promise<{ success: boolean; message: string }> {
    try {
        const users = await getUsersCollection();
        const user = await users.findOne({ email });

        if (!user) {
            return { success: false, message: "Account not found." };
        }
        if (user.isVerified) {
            return { success: false, message: "Account is already verified." };
        }

        const otp = generateOtp();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        
        await users.updateOne({ email }, { $set: { otp, otpExpires }});
        await sendOtpEmail(email, otp);

        return { success: true, message: "A new verification code has been sent." };
    } catch (error) {
        console.error("Error resending OTP:", error);
        return { success: false, message: "An unexpected error occurred." };
    }
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean, message: string }> {
    try {
        const users = await getUsersCollection();
        const user = await users.findOne({ email });

        if (!user) {
            // To prevent user enumeration, we send a success message even if the user doesn't exist.
            return { success: true, message: "If an account with that email exists, a password reset code has been sent." };
        }

        const otp = generateOtp();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        
        await users.updateOne({ email }, { $set: { otp, otpExpires }});
        await sendPasswordResetEmail(email, otp);

        return { success: true, message: "If an account with that email exists, a password reset code has been sent." };
    } catch (error) {
        console.error("Error requesting password reset:", error);
        return { success: false, message: "An unexpected error occurred." };
    }
}

export async function resetPasswordWithOtp(email: string, otp: string, newPassword: string): Promise<{ success: boolean, message: string }> {
    try {
        const users = await getUsersCollection();
        const user = (await users.findOne({ email })) as User | null;

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
        await users.updateOne({ email }, { $set: { password: hashedPassword, otp: undefined, otpExpires: undefined } });

        return { success: true, message: 'Password has been reset successfully. You can now log in.' };
    } catch (error) {
        console.error("Error resetting password:", error);
        return { success: false, message: "An unexpected error occurred." };
    }
}

export async function createUserAsAdmin(email: string, password: string): Promise<{ success: boolean; message: string }> {
  try {
    const users = await getUsersCollection();
    const existingUser = await users.findOne({ email });

    if (existingUser) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const hashedPassword = await hashPassword(password);
    const newUser: User = {
      id: email,
      email,
      password: hashedPassword,
      createdAt: Date.now(),
      isVerified: true, // Automatically verify admin-created users
    };

    await users.insertOne(newUser);

    return { success: true, message: 'User created successfully.' };
  } catch (error) {
    console.error('Error creating user as admin:', error);
    return { success: false, message: 'Failed to create user. Please try again.' };
  }
}

// These functions are for the admin page to interact with the MongoDB database.
export async function getAllUsers(): Promise<User[]> {
    const usersCollection = await getUsersCollection();
    const users = await usersCollection.find({}).toArray();
    // Convert MongoDB documents to plain objects
    return users.map((userDoc) => {
        const { _id, ...user } = userDoc;
        return { ...user, id: _id.toString() } as User;
    });
}

export async function saveUser(user: User & { _id?: any }): Promise<void> {
    const usersCollection = await getUsersCollection();
    // Prevent trying to update the immutable _id field
    const { id, _id, ...userToSave } = user;
    await usersCollection.updateOne({ email: user.email }, { $set: userToSave }, { upsert: true });
}

export async function deleteUser(email: string): Promise<void> {
    const usersCollection = await getUsersCollection();
    await usersCollection.deleteOne({ email });
}

export async function getUser(email: string): Promise<User | null> {
    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ email });
    if (user) {
        const { _id, ...rest } = user;
        return { ...rest, id: _id.toString() } as User;
    }
    return null;
}
