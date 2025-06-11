import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';
import { LockKeyhole, UserPlus2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import FuturisticLayout from '@/components/FuturisticLayout';

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

  const handleExtensionLogin = async () => {
    try {
      if (!user) return;
      
      const tokenData = {
        userId: user.id,
        exp: Date.now() + (24 * 60 * 60 * 1000)
      };
      
      const token = Buffer.from(JSON.stringify(tokenData)).toString('base64');
      localStorage.setItem('jobmate_extension_token', token);
      
      if (typeof window !== 'undefined') {
        const isExtension = document.referrer.includes('chrome-extension://');
        
        if (isExtension) {
          window.postMessage({ 
            type: 'JOBMATE_LOGIN_SUCCESS', 
            token: token 
          }, '*');
          
          setTimeout(() => {
            window.close();
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Extension login error:', error);
    }
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        handleExtensionLogin();
      } else {
        setUser(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        handleExtensionLogin();
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [handleExtensionLogin]);

  useEffect(() => {
    if (user) {
      handleExtensionLogin();
    }
  }, [user, handleExtensionLogin]);

  const resetFields = () => {
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  const handleAuth = async () => {
    setError('');
    setLoading(true);

    if (!email || !password || (mode === 'signup' && !name)) {
      setLoading(false);
      return setError('Please fill in all required fields');
    }

    if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      setLoading(false);

      if (signUpError) return setError(signUpError.message);

      alert('🎉 Account created! Please check your email to confirm your address.');
      resetFields();
      setMode('login');
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (loginError) return setError(loginError.message);

    resetFields();
    router.push('/home');
  };

  return (
    <FuturisticLayout>
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          className="glass-card max-w-md w-full p-8 hover-lift"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <motion.div
              className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              {mode === 'login' ? (
                <LockKeyhole className="w-8 h-8 text-white" />
              ) : (
                <UserPlus2 className="w-8 h-8 text-white" />
              )}
            </motion.div>
            
            <h1 className="text-3xl font-bold gradient-text cyber-heading mb-2">
              {mode === 'login' ? 'Access Portal' : 'Join JobMate'}
            </h1>
            <p className="text-gray-400 elegant-text">
              {mode === 'login' ? 'Enter your credentials to continue' : 'Create your AI-powered profile'}
            </p>
          </div>

          <div className="space-y-6">
            {mode === 'signup' && (
              <div className="cyber-input-container">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="cyber-input w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            
            <div className="cyber-input-container">
              <input
                type="email"
                placeholder="Email Address"
                className="cyber-input w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="relative cyber-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="cyber-input w-full pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {mode === 'login' && (
              <div className="text-center">
                <Link href="/forgot-password" className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm">
                  Forgot Password?
                </Link>
              </div>
            )}

            {error && (
              <div className="glass-card p-4 border border-red-400/50 bg-red-500/10">
                <p className="text-red-400 text-sm text-center">{error}</p>
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
                  Processing...
                </div>
              ) : (
                mode === 'login' ? 'Access Dashboard' : 'Create Account'
              )}
            </motion.button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-gray-400">or continue with</span>
              </div>
            </div>

            <motion.button
              className="glass-card w-full py-4 border border-gray-400/50 hover:border-cyan-400/50 transition-colors flex items-center justify-center gap-3"
              onClick={handleGoogleLogin}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Image
                src="/google_logo.png"
                alt="Google Logo"
                width={20}
                height={20}
              />
              <span>Sign in with Google</span>
            </motion.button>

            <div className="text-center pt-6">
              <p className="text-gray-400 elegant-text">
                {mode === 'login' ? 'New to JobMate?' : 'Already have an account?'}{' '}
                <button
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
                >
                  {mode === 'login' ? 'Create Account' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </FuturisticLayout>
  );
}