// src/services/supabase-auth.ts (Complete for Auth Flow)

import { supabase } from "@/supabase-client"
import type { Session, User } from '@supabase/supabase-js' // Import necessary types

/**
 * Initiates the passwordless login flow by sending an OTP to the user's email.
 * @param email - User's email address.
 */
export async function sendMagicLinkOrOTP(email: string) {
  const { error } = await supabase.auth.signInWithOtp({ 
    email,
    options: {
      emailRedirectTo: undefined, // Handle OTP on the next screen
      shouldCreateUser: true,     // Allow new users to sign up this way
    }
  })

  if (error) {
    console.error('Send OTP Error:', error.message)
    throw new Error(error.message)
  }
}

/**
 * Completes the sign-in process by verifying the OTP sent to the email.
 * @param email - User's email address (needed for OTP verification).
 * @param token - The six-digit code received by the user.
 * @returns The authenticated user data.
 */
export async function verifyOTP(email: string, token: string): Promise<User | null> {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email', 
  })

  if (error) {
    console.error('Verify OTP Error:', error.message)
    throw new Error(error.message)
  }

  return data.user
}

// 🛑 ADDED: Function required for the TanStack Router root loader 🛑
/**
 * Fetches the active Supabase session from local storage/server check.
 * This is used to determine if a user is currently logged in.
 * @returns The current Session object or null.
 */
export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Get Session Error:', error.message)
    return null
  }
  
  return data.session
}

/**
 * Logs the current user out.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Sign Out Error:', error.message)
    throw new Error(error.message)
  }
}