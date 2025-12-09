// src/routes/__root.tsx

import { HeadContent, Outlet, createRootRouteWithContext, redirect } from '@tanstack/react-router'

// 🛑 IMPORT SESSION LOGIC AND TYPES 🛑
import { sessionRootLoader } from '@/auth/session-provider' 
import type { SessionRouterContext } from '@/auth/session-provider'

import type { QueryClient } from '@tanstack/react-query'

// 🛑 AUGMENT THE CONTEXT INTERFACE 🛑
// Combine the TanStack Query context with your custom Session context.
interface MyRouterContext extends SessionRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  // 🛑 ADD THE LOADER FUNCTION 🛑
  loader: async ({ location }) => {
    // 1. Execute the shared session fetch logic
    const { session } = await sessionRootLoader()

    // 2. Define protection rules
    const publicPaths = ['/login', '/login/otp', '/']
    const isProtectedRoute = !publicPaths.includes(location.pathname)

    // 3. Handle redirects if unauthenticated user hits a protected route
    if (!session && isProtectedRoute) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
    
    // 4. Return the session object to merge it into the context for child routes
    return { session } 
  },
  
  component: () => (
    <>
      <HeadContent />
      {/*<Header />*/}
      <div className=''>
        <Outlet />
      </div>
      {/* Devtools configuration omitted for brevity */}
    </>
  ),
})