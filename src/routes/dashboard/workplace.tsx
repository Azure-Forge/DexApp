import { createFileRoute } from '@tanstack/react-router'
import { EmptyDemo } from '@/components/desk-empty'
export const Route = createFileRoute('/dashboard/workplace')({
  component: RouteComponent,
})

function RouteComponent() {
  return (<Page />)
}

export function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <EmptyDemo />
      </div>
    </div>
  )
}