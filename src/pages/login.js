// pages/login.js

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';
import { LockKeyhole, UserPlus2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Typography } from '@mui/material';
import Link from 'next/link';

const futuristicStyles = `
  .futuristic-bg {
    background: linear-gradient(135deg, #0a0a23 0%, #1a1a4e 50%, #2a1a6e 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    padding: 16px;
  }
  .futuristic-bg::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(147, 51, 234, 0.3), transparent 70%);
    animation: glow 12s infinite ease-in-out;
    z-index: 0;
  }
  @keyframes glow {
    0%, 100% { opacity: 0.2; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(1.1); }
  }
  .futuristic-card {
    background: rgba(30, 30, 60, 0.7);
    border: 1px solid rgba(147, 51, 234, 0.6);
    border-radius: 16px;
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    padding: 24px;
    margin: 16px;
    max-width: 400px;
    width: 100%;
    position: relative;
    z-index: 1;
    transition: transform 0.3s ease;
  }
  .futuristic-card:hover {
    transform: translateY(-4px);
  }
  .futuristic-text {
    color: #d4d4ff;
    text-shadow: 0 0 4px rgba(147, 51, 234, 0.3);
  }
  .futuristic-input {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(147, 51, 234, 0.5);
    border-radius: 8px;
    color: #d4d4ff;
    padding: 12px;
    width: 100%;
    font-size: 14px;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
  .futuristic-input::placeholder {
    color: rgba(212, 212, 255, 0.5);
  }
  .futuristic-input:focus {
    outline: none;
    border-color: #9333ea;
    box-shadow: 0 0 8px rgba(147, 51, 234, 0.6);
  }
  .futuristic-button {
    background: linear-gradient(90deg, #9333ea, #3b82f6);
    border: none;
    border-radius: 8px;
    padding: 10px;
    font-size: 14px;
    color: #fff;
    font-weight: 600;
    text-transform: uppercase;
    width: 100%;
    transition: all 0.3s ease;
  }
  .futuristic-button:hover {
    background: linear-gradient(90deg, #a855f7, #60a5fa);
    box-shadow: 0 0 12px rgba(147, 51, 234, 0.6);
  }
  .futuristic-link {
    color: #60a5fa;
    text-decoration: none;
    transition: color 0.3s ease;
  }
  .futuristic-link:hover {
    color: #a855f7;
    text-decoration: underline;
  }
  .error-text {
    color: #f87171;
    text-shadow: 0 0 3px rgba(248, 113, 113, 0.3);
  }
`;

export default function AuthPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [mode, setMode] = useState(typeof window !== 'undefined' && router?.query?.mode === 'signup' ? 'signup' : 'login');

  const handleAuth = async () => {
    setError('');

    if (!email || !password || (mode === 'signup' && !name)) {
      return setError('Please fill in all required fields');
    }

    if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) return setError(signUpError.message);

      alert('🎉 Account created! Please check your email to confirm your address.');
      setMode('login');
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) return setError(loginError.message);

    const { data: { session } } = await supabase.auth.getSession();

    const userId = session?.user?.id;
    const userEmail = session?.user?.email;

    if (userId) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!existingUser) {
        const { error: insertError } = await supabase.from('users').insert([
          {
            id: userId,
            email: userEmail,
            name: name || 'User',
            signup_time: new Date().toISOString(),
          },
        ]);

        if (insertError) {
          console.error('User insert error:', insertError.message);
          return setError('Failed to save user info');
        }
      }
    }

    router.push('/home');
  };

  return (
    <div className="futuristic-bg">
      <style>{futuristicStyles}</style>
      <motion.div
        className="futuristic-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-6">
          {mode === 'login' ? (
            <LockKeyhole className="w-8 h-8 mx-auto mb-2" style={{ color: '#9333ea', filter: 'drop-shadow(0 0 4px rgba(147, 51, 234, 0.6))' }} />
          ) : (
            <UserPlus2 className="w-8 h-8 mx-auto mb-2" style={{ color: '#9333ea', filter: 'drop-shadow(0 0 4px rgba(147, 51, 234, 0.6))' }} />
          )}
          <Typography
            variant="h5"
            className="futuristic-text font-bold"
            style={{
              background: 'linear-gradient(90deg, #9333ea, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {mode === 'login' ? 'Access Portal' : 'Join JobMate'}
          </Typography>
          <Typography className="futuristic-text text-sm opacity-70 mt-1">
            {mode === 'login' ? 'Enter your credentials' : 'Create your profile'}
          </Typography>
        </div>

        {mode === 'signup' && (
          <input
            type="text"
            placeholder="Full Name"
            className="futuristic-input mb-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          className="futuristic-input mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="futuristic-input mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {mode === 'login' && (
          <div className="text-right mb-4">
            <Link href="/forgot-password" className="futuristic-link text-sm">
              Forgot Password?
            </Link>
          </div>
        )}

        {error && (
          <Typography className="error-text text-sm mb-4 text-center">
            {error}
          </Typography>
        )}

        <motion.button
          className="futuristic-button"
          onClick={handleAuth}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {mode === 'login' ? 'Login' : 'Sign Up'}
        </motion.button>

        <Typography className="futuristic-text text-sm text-center mt-4">
          {mode === 'login' ? 'New to JobMate?' : 'Already a member?'}{' '}
          <span
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="futuristic-link cursor-pointer"
          >
            {mode === 'login' ? 'Sign Up' : 'Login'}
          </span>
        </Typography>
      </motion.div>
    </div>
  );
}
