//components/profile-section.tsx

import { useNavigate } from '@tanstack/react-router'
import { Button } from "@/components/ui/button"
import { useState } from 'react'

// Import the correct Supabase types and service functions
import type { Session } from '@supabase/supabase-js' 
import { signOut } from '@/auth/supabase-auth' // Adjust path if needed

interface ProfileSectionProps {
     session: Session | null;
}

export function ProfileSection({ session }: ProfileSectionProps) {
     const navigate = useNavigate()
     const [loading, setLoading] = useState(false)
    
     // The 'user' property lives on the 'session' object
     const user = session?.user;

     // This conditional check relies on the root loader to prevent unauthenticated access.
     if (!user) {
         // If the user somehow lands here without a session, navigate them back.
         return (
      <div className="text-red-500">
        User not authenticated.
      </div>
    );
     }

     const handleLogout = async () => {
         setLoading(true);
         try {
            await signOut(); // Call the service function
    
            // Navigate to the login page and fully reload the application state
            // This ensures the router re-runs all initial checks (the root loader)
            navigate({ to: '/login', replace: true });
    
         } catch (error) {
            console.error('Logout failed:', error);
            // Provide user feedback on failure
            alert('Logout failed. Please try again.'); 
         } finally {
            setLoading(false);
         }
     };

     return (
         <div className="max-w-md mx-auto p-6 border rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
            <div className="space-y-3 mb-6">
              <p className="text-lg font-medium">
                   Status: <span className="text-green-600">Logged In</span>
              </p>
              <p className="text-lg">
                   Email: <strong className="break-all">{user.email}</strong>
              </p>
              <p className="text-sm text-gray-500">
                   User ID: <code className="text-xs">{user.id}</code>
              </p>
            </div>
    
            <Button 
              onClick={handleLogout} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Signing Out...' : 'Log Out'}
            </Button>
         </div>
     );
}