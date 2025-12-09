// src/routes/profile/index.tsx

import { ProfileSection } from '@/components/profile-section'
// 1. Import getRouteApi
import { createFileRoute, getRouteApi } from '@tanstack/react-router'

// 2. Create an API accessor for the ROOT route (where the loader actually is)
// Use '__root__' as the ID because that is where you defined the loader
const routeApi = getRouteApi('__root__')

export const Route = createFileRoute('/profile/')({
  component: RouteComponent,
})

function RouteComponent() {
  // 3. Use routeApi instead of Route
  // This safely fetches the data returned by the root loader
  const { session } = routeApi.useLoaderData()
  
  return (
    <div className="p-6">
      <ProfileSection session={session} />
    </div>
  )
}