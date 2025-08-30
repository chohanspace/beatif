
"use server";

import { getUser, saveUser } from './firebase';
import { sendWelcomeEmail } from './email';
import type { User } from './types';

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


export async function signUp(email: string, password: string): Promise<{ success: boolean; message: string }> {
  try {
    const existingUser = await getUser(email);
    if (existingUser) {
        return { success: false, message: 'An account with this email already exists.' };
    }

    const hashedPassword = await hashPassword(password);
    const newUser: User = {
        id: email, 
        email,
        password: hashedPassword,
        createdAt: Date.now(),
    };
    
    await saveUser(newUser);
    await sendWelcomeEmail(email);

    return { success: true, message: 'Account created successfully! You can now log in.' };
  } catch (error) {
    console.error('Error during sign up:', error);
    return { success: false, message: 'Failed to create account. Please try again.' };
  }
}


export async function login(email: string, password: string): Promise<{ success: boolean; message: string; user?: Omit<User, 'password'> }> {
  try {
    const user = await getUser(email);

    if (!user || !user.password) {
      return { success: false, message: 'Invalid email or password.' };
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return { success: false, message: 'Invalid email or password.' };
    }

    // Return user object without sensitive info
    const { password: _password, ...userToReturn } = user;

    return { success: true, message: 'Login successful.', user: userToReturn };

  } catch (error) {
    console.error('Error during login:', error);
    return { success: false, message: 'An error occurred during login.' };
  }
}
