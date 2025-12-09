// src/components/login-form.tsx

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router' // Import for navigation
import { GalleryVerticalEnd } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { sendMagicLinkOrOTP } from '@/auth/supabase-auth'


export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    try {
      // 1. Call the service to send the OTP/Magic Link
      await sendMagicLinkOrOTP(email)
      
      console.log('OTP sent successfully. Navigating to verification screen.')

      // 2. Navigate to the OTP verification route, passing the email as a search parameter
      navigate({
        to: '/login/otp',
        search: { email: email } 
      })

    } catch (err) {
      // Catch and display the error message thrown by the service function
      setErrorMessage((err as Error).message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            {/* Logo/Header */}
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Acme Inc.</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to Acme Inc.</h1>
            <FieldDescription>
              Don&apos;t have an account? <a href="#">Sign up</a>
            </FieldDescription>
          </div>

          {/* Error Message Display */}
          {errorMessage && (
            <div className="rounded-md bg-red-100 p-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {/* Email Field */}
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          
          {/* Action Button */}
          <Field>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending Code...' : 'Continue'}
            </Button>
          </Field>
          
          <FieldSeparator>Or</FieldSeparator>
          <Field className="grid gap-4 sm:grid-cols-2">
            {/* Social Logins */}
            <Button variant="outline" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12.152 6.896c..." fill="currentColor" />
              </svg>
              Continue with Apple
            </Button>
            <Button variant="outline" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12.48 10.92v3.28h7.84c..." fill="currentColor" />
              </svg>
              Continue with Google
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}