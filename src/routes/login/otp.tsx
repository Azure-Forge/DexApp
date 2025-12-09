// src/routes/login/otp.tsx

import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod' // You'll need to install 'zod' if you haven't already
import { OTPForm } from '@/components/otp-form'

// 1. Define the expected search parameter schema
const otpSearchSchema = z.object({
  // The email parameter is required and must be a valid email format
  email: z.string().email('A valid email is required for OTP verification.'),
})

export const Route = createFileRoute('/login/otp')({
  // Use the search schema to parse and validate the URL parameter
  validateSearch: otpSearchSchema,
  
  // 2. Perform a check before the component loads
  // If the email parameter is missing or invalid, redirect the user back to the main login page
  beforeLoad: ({ search }) => {
    // TanStack Router will throw if validation fails, but this redirect ensures a clean return
    if (!search.email) {
      throw redirect({ to: '/login' })
    }
  },
  
  component: OTPPage,
})


export function OTPPage() {
  // 3. Access the validated search parameters within the component
  const { email } = Route.useSearch() 
  
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-xs">
        {/* 4. Pass the extracted email down to the OTPForm component */}
        <OTPForm email={email} />
      </div>
    </div>
  )
}