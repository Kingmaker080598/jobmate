import { UserProvider } from '@/contexts/UserContext';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { GoogleOAuthProvider } from '@react-oauth/google';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      <UserProvider>
        <Component {...pageProps} />
      </UserProvider>
    </GoogleOAuthProvider>
  );
}

export default MyApp;
