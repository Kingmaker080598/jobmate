// pages/auth/callback.js
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        // Check if this is an extension login
        const urlParams = new URLSearchParams(window.location.search);
        const isExtension = urlParams.get('extension') === 'true';
        
        if (isExtension) {
          // Close this tab and return to the previous page
          window.close();
        } else {
          router.replace('/home')
        }
      } else {
        // Wait for session to initialize from cookie
        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
          if (session) {
            // Check if this is an extension login
            const urlParams = new URLSearchParams(window.location.search);
            const isExtension = urlParams.get('extension') === 'true';
            
            if (isExtension) {
              // Close this tab and return to the previous page
              window.close();
            } else {
              router.replace('/home')
            }
          } else {
            router.replace('/login')
          }
        })

        return () => {
          listener.subscription.unsubscribe()
        }
      }
    }

    handleAuth()
  }, [router])

  return <p className="text-white p-6">Finishing sign-in...</p>
}
