//handleUserSign.ts
import { supabase } from '../supabase-client'

// Fetch the currently logged-in user and their profile
export async function getUserProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!user) return null

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) throw profileError
  return { user, profile }
}

// Insert or update user profile safely
export async function upsertUserProfile(profileData: {
  username?: string
  role?: string
  email?: string
}) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) throw userError || new Error('No user')

  const { error: upsertError } = await supabase.from('profiles').upsert({
    id: user.id,
    ...profileData,
  })

  if (upsertError) throw upsertError
  return true
}

// Sign in with email/password
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data.user
}

// Sign up with email/password
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) throw error
  return data.user
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  return true
}
