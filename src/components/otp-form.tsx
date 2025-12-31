// src/components/otp-form.tsx

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'


import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { sendMagicLinkOrOTP, verifyOTP } from '@/auth/supabase-auth'

// Define the expected prop interface
interface OTPFormProps extends React.ComponentProps<typeof Card> {
    email: string;
}

export function OTPForm({ email, ...props }: OTPFormProps) {
  const navigate = useNavigate()
  const [token, setToken] = useState('') // State to hold the 6-digit code
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // 1. Handle OTP Verification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    if (token.length !== 6) {
        setErrorMessage('Please enter the full 6-digit code.')
        setLoading(false)
        return
    }

    try {
      // Call the service function to verify the OTP
      await verifyOTP(email, token)
      
      console.log('OTP verification successful! Logged in.')

      // Redirect to a protected route on successful login
      navigate({ to: '/dashboard' })

    } catch (err) {
      setErrorMessage('Invalid or expired code. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // 2. Handle Resending the Code
  const handleResend = async (e: React.MouseEvent) => {
    e.preventDefault()
    setResendLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)
    
    try {
        await sendMagicLinkOrOTP(email)
        setSuccessMessage('A new code has been sent! Check your inbox.')
    } catch (err) {
        setErrorMessage('Failed to resend code. Please wait a moment and try again.')
    } finally {
        setResendLoading(false)
    }
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Enter verification code</CardTitle>
        {/* Use the email prop to display where the code was sent */}
        <CardDescription>We sent a 6-digit code to **{email}**.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            
            {/* Error/Success Messages */}
            {errorMessage && (
                <div className="rounded-md bg-red-100 p-3 text-sm text-red-700">
                    {errorMessage}
                </div>
            )}
            {successMessage && (
                <div className="rounded-md bg-green-100 p-3 text-sm text-green-700">
                    {successMessage}
                </div>
            )}

            <Field>
              <FieldLabel htmlFor="otp">Verification code</FieldLabel>
              {/* Bind the value and onChange handler to the state */}
              <InputOTP 
                maxLength={6} 
                id="otp" 
                required 
                value={token} 
                onChange={(value) => setToken(value)}
              >
                <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <FieldDescription>
                Enter the 6-digit code sent to your email.
              </FieldDescription>
            </Field>
            
            <FieldGroup>
              <Button type="submit" disabled={loading || resendLoading}>
                {loading ? 'Verifying...' : 'Verify'}
              </Button>
              
              <FieldDescription className="text-center">
                Didn&apos;t receive the code? 
                <button 
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading || loading}
                    className="ml-1 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                    {resendLoading ? 'Sending...' : 'Resend'}
                </button>
              </FieldDescription>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}