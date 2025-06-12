import { UserProvider } from '@/contexts/UserContext';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
        <UserProvider>
          <Component {...pageProps} />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#333',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
                duration: 6000,
              },
              loading: {
                iconTheme: {
                  primary: '#3b82f6',
                  secondary: '#fff',
                },
              },
            }}
          />
        </UserProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
}

export default MyApp;