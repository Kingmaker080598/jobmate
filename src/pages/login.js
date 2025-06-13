import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';
import { LockKeyhole, UserPlus2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function AuthPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [mode, setMode] = useState(typeof window !== 'undefined' && router?.query?.mode === 'signup' ? 'signup' : 'login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState(null);

  const handleExtensionLogin = useCallback(async () => {
    try {
      if (!user) return;
      
      console.log('Generating extension token for user:', user.id);
      
      // Generate token from the API
      const response = await fetch('/api/extension-token', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const token = data.token;
        
        console.log('Token generated successfully, storing in localStorage');
        localStorage.setItem('jobmate_extension_token', token);
        
        // Post message to window for extension detection
        if (typeof window !== 'undefined') {
          window.postMessage({ 
            type: 'JOBMATE_LOGIN_SUCCESS', 
            token: token 
          }, window.location.origin);
          
          console.log('Posted login success message to window');
          
          // Check if this is an extension context
          const isExtension = document.referrer.includes('chrome-extension://') || 
                             window.location.search.includes('extension=true');
          
          if (isExtension) {
            console.log('Extension context detected, will close window after delay');
            setTimeout(() => {
              window.close();
            }, 1000);
          }
        }
      } else {
        console.error('Failed to generate extension token:', response.status);
      }
    } catch (error) {
      console.error('Extension login error:', error);
    }
  }, [user]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      if (session?.user) {
        setUser(session.user);
        
        // If user just signed in, redirect to home
        if (event === 'SIGNED_IN') {
          console.log('User signed in, redirecting to home');
          router.push('/home');
        }
      } else {
        setUser(null);
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        console.log('Existing session found:', session.user.id);
        setUser(session.user);
        // Don't auto-redirect here, let the auth state change handle it
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (user) {
      handleExtensionLogin();
    }
  }, [user, handleExtensionLogin]);

  const resetFields = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error('Google login error:', error);
        setError(error.message);
      }
    } catch (error) {
      console.error('Google login exception:', error);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    setError('');
    setLoading(true);

    if (!email || !password || (mode === 'signup' && !name)) {
      setLoading(false);
      return setError('Please fill in all required fields');
    }

    try {
      if (mode === 'signup') {
        console.log('Attempting signup for:', email);
        
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            }
          }
        });

        if (signUpError) {
          console.error('Signup error:', signUpError);
          throw signUpError;
        }

        console.log('Signup successful:', data);
        alert('🎉 Account created! Please check your email to confirm your address.');
        resetFields();
        setMode('login');
        return;
      } else {
        console.log('Attempting login for:', email);
        
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) {
          console.error('Login error:', loginError);
          throw loginError;
        }

        console.log('Login successful:', data);
        resetFields();
        // Don't manually redirect here, let the auth state change handle it
      }
    } catch (error) {
      console.error('Auth error:', error);
      
      // Provide user-friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Please check your email and click the confirmation link before signing in.');
      } else if (error.message.includes('Too many requests')) {
        setError('Too many login attempts. Please wait a moment and try again.');
      } else if (error.message.includes('Failed to fetch')) {
        setError('Connection error. Please check your internet connection and try again.');
      } else {
        setError(error.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-4">
      <motion.div
        className="glass-card max-w-md w-full p-8 hover-lift"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <motion.div
            className="w-16 h-16 mx-auto mb-6 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Image
              src="/favicon-32x32.png"
              alt="JobMate Logo"
              width={64}
              height={64}
              className="rounded-lg"
            />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Join JobMate'}
          </h1>
          <p className="text-gray-600">
            {mode === 'login' ? 'Sign in to your account' : 'Create your AI-powered profile'}
          </p>
        </div>

        <div className="space-y-6">
          {mode === 'signup' && (
            <div className="cyber-input-container">
              <input
                type="text"
                placeholder="Full Name"
                className="cyber-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          )}
          
          <div className="cyber-input-container">
            <input
              type="email"
              placeholder="Email Address"
              className="cyber-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="relative cyber-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="cyber-input pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {mode === 'login' && (
            <div className="text-center">
              <Link href="/forgot-password" className="text-blue-600 hover:text-blue-700 transition-colors text-sm">
                Forgot Password?
              </Link>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm text-center">{error}</p>
            </div>
          )}

          <motion.button
            className="cyber-button w-full text-lg py-4"
            onClick={handleAuth}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
              </div>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </motion.button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or continue with</span>
            </div>
          </div>

          <motion.button
            className="w-full py-4 border border-gray-300 hover:border-blue-500 bg-white hover:bg-blue-50 transition-colors flex items-center justify-center gap-3 rounded-lg disabled:opacity-50"
            onClick={handleGoogleLogin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            <Image
              src="/google_logo.png"
              alt="Google Logo"
              width={20}
              height={20}
            />
            <span className="text-gray-700">Sign in with Google</span>
          </motion.button>

          <div className="text-center pt-6">
            <p className="text-gray-600">
              {mode === 'login' ? 'New to JobMate?' : 'Already have an account?'}{' '}
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  resetFields();
                }}
                className="text-blue-600 hover:text-blue-700 transition-colors font-semibold"
                disabled={loading}
              >
                {mode === 'login' ? 'Create Account' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}