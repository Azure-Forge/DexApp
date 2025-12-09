// src/lib/pingSupabase.ts
import { supabase } from './supabase-client'

export async function pingSupabase() {
  try {
    // Replace 'profiles' with any table in your project
    const { error } = await supabase.from('profiles').select('*').limit(1)
    if (error) throw error
    console.log('✅ Supabase connection OK')
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('⚠️ Supabase connection failed:', err.message)
    } else {
      console.error('⚠️ Supabase connection failed:', err)
    }
  }
}

