// src/providers/session-provider.ts

import type { Session } from '@supabase/supabase-js'
import { getSession } from '@/auth/supabase-auth' 


// 1. DEFINE THE ROUTER CONTEXT INTERFACE
export interface SessionRouterContext {
  // This is the data that will be attached to the router context object
  session: Session | null
}

// 2. DEFINE THE ROOT LOADER FUNCTION
// This function fetches the session and is reusable.
export async function sessionRootLoader() {
  // ✅ Now 'getSession' is recognized
  const session = await getSession()
  return { session } // Returns the object that will be merged into the context
}