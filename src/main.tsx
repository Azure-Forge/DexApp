import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider.tsx'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import './styles.css'
import reportWebVitals from './reportWebVitals.ts'

// 🛑 ADDITION 1: Import the Session type from Supabase
import type { Session } from '@supabase/supabase-js' 

// 🛑 ADDITION 2: Define your custom Router Context Interface
// This interface defines the data structure that will be available globally.
export interface RouterContext {
  // Add the session property, which will be populated in the __root.tsx loader
  session: Session | null
  // The rest of the context properties (like queryClient) are merged below
}

// Create a new router instance

const TanStackQueryProviderContext = TanStackQueryProvider.getContext()

// 🛑 ADDITION 3: Create the initial context object, merging TanStack Query with the new 'session' property
const initialContext: RouterContext & typeof TanStackQueryProviderContext = {
  ...TanStackQueryProviderContext, // Merge TanStack Query's context data
  session: null, // Initialize session as null
}

const router = createRouter({
  routeTree,
  // 🛑 PASS THE MERGED CONTEXT: Ensure the router uses the object containing 'session'
  context: initialContext, 
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
    // 🛑 ADDITION 4: Register the new context interface globally
    // This is the key fix for the 'context.session' TypeScript error.
    routerContext: RouterContext & typeof TanStackQueryProviderContext
  }
}

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
        <RouterProvider router={router} />
      </TanStackQueryProvider.Provider>
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()