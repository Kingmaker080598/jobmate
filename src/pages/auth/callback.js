import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      try {
        console.log('Auth callback triggered');
        
        // Handle the auth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.replace('/login?error=' + encodeURIComponent(error.message));
          return;
        }

        if (data.session) {
          console.log('Session found in callback:', data.session.user.id);
          
          // Generate extension token for the user
          try {
            const response = await fetch('/api/extension-token', {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Accept': 'application/json'
              }
            });
            
            if (response.ok) {
              const tokenData = await response.json();
              localStorage.setItem('jobmate_extension_token', tokenData.token);
              
              // Post message for extension
              window.postMessage({ 
                type: 'JOBMATE_LOGIN_SUCCESS', 
                token: tokenData.token 
              }, window.location.origin);
              
              console.log('Extension token generated and stored');
            }
          } catch (tokenError) {
            console.error('Failed to generate extension token:', tokenError);
          }
          
          // Check if this is an extension login
          const urlParams = new URLSearchParams(window.location.search);
          const isExtension = urlParams.get('extension') === 'true';
          
          if (isExtension) {
            // Close this tab and return to the previous page
            setTimeout(() => {
              window.close();
            }, 1000);
          } else {
            router.replace('/home');
          }
        } else {
          console.log('No session found, redirecting to login');
          router.replace('/login');
        }
      } catch (error) {
        console.error('Auth callback exception:', error);
        router.replace('/login?error=' + encodeURIComponent('Authentication failed'));
      }
    }

    handleAuth();
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign-in...</p>
      </div>
    </div>
  );
}