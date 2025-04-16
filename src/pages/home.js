// pages/home.js

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
// import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { User, Clock, ClipboardList, Sparkles, FileText, Search, Settings, Wand } from 'lucide-react';
import { motion } from 'framer-motion';
import ChatIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { Typography, Button as MuiButton, LinearProgress } from '@mui/material';

// Premium Luxurious Futuristic CSS
const futuristicStyles = `
  .futuristic-bg {
    background: linear-gradient(135deg, #0d0221 0%, #1a0b4e 50%, #2a1a6e 100%);
    min-height: 100vh;
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
    background: radial-gradient(circle, rgba(255, 215, 0, 0.2), transparent 70%);
    animation: glow 12s infinite ease-in-out;
    z-index: 0;
  }
  .futuristic-bg::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, rgba(212, 181, 241, 0), rgba(255, 215, 0, 0.1));
    opacity: 0.3;
    z-index: 0;
  }
  .futuristic-starfield {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"><circle cx="2" cy="2" r="1" fill="rgba(255, 215, 0, 0.8)"/></svg>');
    background-size: 4px;
    animation: shimmer 60s linear infinite;
    z-index: 0;
  }
  @keyframes glow {
    0%, 100% { opacity: 0.2; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(1.1); }
  }
  @keyframes shimmer {
    0% { background-position: 0 0; }
    100% { background-position: 1000px 1000px; }
  }
  .futuristic-container {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    position: relative;
    z-index: 1;
    padding: 6rem 1.5rem;
  }
  .futuristic-header {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid transparent;
    border-image: linear-gradient(90deg, #9333ea, #FFD700) 1;
    border-radius: 12px;
    backdrop-filter: blur(10px);
    padding: 32px;
    box-shadow: 0 0 25px rgba(255, 215, 0, 0.5);
    animation: pulse-header 6s infinite ease-in-out;
  }
  @keyframes pulse-header {
    0%, 100% { box-shadow: 0 0 25px rgba(255, 215, 0, 0.5); }
    50% { box-shadow: 0 0 35px rgba(147, 51, 234, 0.7); }
  }
  .futuristic-header-text {
    color:rgb(219, 212, 212);
    font-family: 'Orbitron', sans-serif;
    text-shadow: 0 0 12px rgba(74, 114, 143, 0.7);
    animation: glow-text 3s ease-in-out infinite;
  }
  @keyframes glow-text {
    0%, 100% { text-shadow: 0 0 12px rgba(255, 215, 0, 0.7); }
    50% { text-shadow: 0 0 18px rgba(147, 51, 234, 0.9); }
  }
  .futuristic-subtext {
    color:rgb(119, 26, 26);
    text-shadow: 0 0 6px rgba(255, 215, 0, 0.5);
    font-family: 'Roboto', sans-serif;
  }
  .futuristic-card {
    background: rgba(229, 231, 235, 0.9);
    border: 2px solid transparent;
    border-image: linear-gradient(90deg, #9333ea, #FFD700) 1;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    padding: 24px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .futuristic-card:hover {
    transform: translateY(-4px) rotate(1deg);
    box-shadow: 0 6px 30px rgba(255, 215, 0, 0.6);
  }
  .futuristic-coming-soon {
    background: linear-gradient(90deg, #FFD700, #DAA520);
    color: #1e3a8a;
    text-shadow: 0 0 4px rgba(255, 215, 0, 0.5);
    border-radius: 12px;
    padding: 4px 8px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    display: inline-block;
    margin-bottom: 8px;
  }
  .futuristic-icon {
    color:rgb(48, 107, 94);
    filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.6));
    animation: pulse-icon 2s infinite ease-in-out;
  }
  @keyframes pulse-icon {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  .futuristic-text {
    color: #1e3a8a;
    font-family: 'Orbitron', sans-serif;
    text-shadow: none;
  }
  .futuristic-footer-text {
    color: #F5F5F5;
    text-shadow: 0 0 4px rgba(255, 215, 0, 0.3);
    font-family: 'Roboto', sans-serif;
  }
  .futuristic-footer-link {
    color: #F5F5F5;
    text-shadow: 0 0 4px rgba(255, 215, 0, 0.3);
    font-family: 'Roboto', sans-serif;
    transition: color 0.3s ease;
  }
  .futuristic-footer-link:hover {
    color: #FFD700;
    text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
  }
  .futuristic-button {
    background: linear-gradient(90deg, #FFD700, #DAA520);
    border: none;
    border-radius: 8px;
    padding: 12px;
    color: #1e3a8a;
    font-weight: 600;
    text-transform: uppercase;
    font-family: 'Orbitron', sans-serif;
    transition: all 0.3s ease;
  }
  .futuristic-button:hover {
    background: linear-gradient(90deg, #DAA520, #FFD700);
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
  }
  .futuristic-chat {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid transparent;
    border-image: linear-gradient(90deg, #9333ea, #FFD700) 1;
    border-radius: 12px;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  }
  .futuristic-chat-header {
    background: linear-gradient(90deg, #FFD700, #DAA520);
    color: #1e3a8a;
    text-shadow: 0 0 4px rgba(255, 215, 0, 0.3);
    font-family: 'Orbitron', sans-serif;
  }
  .futuristic-chat-text {
    color: #F5F5F5;
    font-family: 'Roboto', sans-serif;
  }
  .futuristic-chat-divider {
    border-color: rgba(255, 215, 0, 0.2);
  }
  .futuristic-progress {
    background: rgba(255, 215, 0, 0.1);
    border-radius: 6px;
    height: 10px;
  }
  .futuristic-progress .MuiLinearProgress-bar {
    background: linear-gradient(90deg, #FFD700, #DAA520);
  }
  .futuristic-step-card {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 215, 0, 0.2);
    border-radius: 8px;
    padding: 16px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .futuristic-step-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
  }
  .futuristic-step-icon {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(255, 215, 0, 0.2);
  }
  .futuristic-step-icon-done {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #FFD700;
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
  }
`;

export default function HomePage() {
  const { user, profile } = useUser();
  const [showChat, setShowChat] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  if (!user) return <Typography className="p-6 futuristic-text">Loading your AI dashboard...</Typography>;

  return (
    <>
      <style>{futuristicStyles}</style>
      <Navbar />
      <div className="futuristic-bg">
        <div className="futuristic-starfield" />
        <div className="futuristic-container">
          <motion.div
            className="futuristic-header text-center mb-20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h1"
              className="futuristic-header-text font-bold"
              style={{
                background: 'linear-gradient(90deg, #FFD700, #C0C0C0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
             Welcome back, {profile?.name || user?.user_metadata?.full_name || user.email.split('@')[0]} 👋

            </Typography>
            <Typography className="futuristic-subtext mt-4 text-2xl w-full text-center">

              Your exclusive AI-powered career companion, crafted to elevate your job search with sophistication.
            </Typography>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-6">
              <Link href="/profile">
                <MuiButton className="futuristic-button px-8 py-3">
                  Elevate Your Profile
                </MuiButton>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' } }}>
            Let&apos;s Get You Set Up
          </Typography>

            <div className="futuristic-card p-6">
              <Typography variant="h6" className="futuristic-subtext mb-2 font-semibold">
                Complete these steps to unlock JobMate&apos;s full potential:
              </Typography>
              <LinearProgress
                variant="determinate"
                value={66}
                className="futuristic-progress"
                sx={{ height: '10px', borderRadius: '6px' }}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-6 px-2 sm:px-4">

                <StepCard label="Complete Profile" done={true} />
                <StepCard label="Download Chrome Extension" done={true} />
                <StepCard label="Auto-Fill Application" done={false} />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h4"
              className="futuristic-text font-bold text-center mb-10"
              style={{
                background: 'linear-gradient(90deg, #FFD700, #C0C0C0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 8px rgba(255, 215, 0, 0.5)',
              }}
            >
              Explore JobMate Features
            </Typography>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-6 px-2 sm:px-4">

              <FeatureCard
                href="/profile"
                icon={<User className="w-6 h-6 futuristic-icon" />}
                title="Manage Profile"
                desc="Upload your master resume and manage your preferences with ease."
              />
              <FeatureCard
                href="/history"
                icon={<Clock className="w-6 h-6 futuristic-icon" />}
                title="Resume History"
                desc="Browse and download your past resume versions effortlessly."
              />
              <FeatureCard
                href="/profile#auto-fill"
                icon={<ClipboardList className="w-6 h-6 futuristic-icon" />}
                title="Auto-Fill Applications"
                desc="Fill job applications quickly with stored details."
              />
            </div>
          </motion.div>

          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h4"
              className="futuristic-text font-bold text-center mb-10"
              style={{
                background: 'linear-gradient(90deg, #FFD700, #C0C0C0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 8px rgba(255, 215, 0, 0.5)',
              }}
            >
              Coming Soon
            </Typography>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              <FeatureCard
                icon={<Sparkles className="w-6 h-6 futuristic-icon" />}
                title="Tailor Resume"
                desc="Generate resumes tailored to job descriptions using AI. Expected in 3 days."
                comingSoon={true}
              />
              <FeatureCard
                icon={<FileText className="w-6 h-6 futuristic-icon" />}
                title="Smart Suggestions"
                desc="Get live recommendations from our AI panel. Launching this week."
                comingSoon={true}
              />
              <FeatureCard
                icon={<Wand className="w-6 h-6 futuristic-icon" />}
                title="AI-Generated Cover Letters"
                desc="Instantly generate ATS-friendly, job-specific cover letters. Coming next!"
                comingSoon={true}
              />
              <FeatureCard
                icon={<Search className="w-6 h-6 futuristic-icon" />}
                title="Job Search Integration"
                desc="Connect with job boards and track openings within JobMate."
                comingSoon={true}
              />
              <FeatureCard
                icon={<Settings className="w-6 h-6 futuristic-icon" />}
                title="Auto Apply Bots"
                desc="Deploy smart bots to apply on your behalf with tailored resumes."
                comingSoon={true}
              />
            </div>
          </motion.div>
        </div>

        <footer className="text-center text-xs futuristic-footer-text py-8 space-y-2">
          <p>© {new Date().getFullYear()} JobMate. Built for job seekers, powered by AI.</p>
          <div className="flex justify-center gap-4 text-sm">
            <Link href="/about" className="futuristic-footer-link">About</Link>
            <Link href="/contact" className="futuristic-footer-link">Contact</Link>
            <Link href="/privacy" className="futuristic-footer-link">Privacy</Link>
            <Link href="/terms" className="futuristic-footer-link">Terms</Link>
          </div>
        </footer>

        <motion.button
          onClick={() => setShowChat(!showChat)}
         className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 p-2 sm:p-3"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ boxShadow: ['0 0 10px rgba(255, 215, 0, 0.5)', '0 0 20px rgba(255, 215, 0, 0.8)', '0 0 10px rgba(255, 215, 0, 0.5)'] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChatIcon className="w-6 h-6" />
        </motion.button>

        {showChat && (
          <div className="fixed bottom-20 right-6 z-40 w-80 futuristic-chat rounded-xl shadow-xl overflow-hidden">
            <div className="futuristic-chat-header p-3 font-semibold">💬 Ask JobMate</div>
            <div className="p-4 text-sm space-y-2 futuristic-chat-text">
              <p><strong>Q:</strong> How do I manage my profile?</p>
              <p><strong>A:</strong> Head to your profile page to upload your resume and set preferences.</p>
              <hr className="my-2 futuristic-chat-divider" />
              <p><strong>Q:</strong> Where is my last resume?</p>
              <p><strong>A:</strong> Check the &apos;Resume History&apos; page for your previous downloads.</p>
              <hr className="my-2 futuristic-chat-divider" />
              <p><strong>Q:</strong> What&apos;s coming next?</p>
              <p><strong>A:</strong> Tailor Resume, Smart Suggestions, AI Cover Letters, and more!</p>
              <p className="text-center mt-3 text-xs opacity-70">Stay tuned for premium updates...</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function FeatureCard({ icon, title, desc, href, comingSoon }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
      whileHover={{ scale: 1.05, rotate: 2 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      {href ? (
        <Link href={href}>
          <div className="cursor-pointer futuristic-card">
            {comingSoon && <div className="futuristic-coming-soon">Coming Soon</div>}
            <div className="mb-4">{icon}</div>
            <Typography variant="h6" className="futuristic-text mb-1 font-semibold">{title}</Typography>
            <Typography className="futuristic-subtext text-sm leading-snug font-medium">{desc}</Typography>
          </div>
        </Link>
      ) : (
        <div className="futuristic-card">
          {comingSoon && <div className="futuristic-coming-soon">Coming Soon</div>}
          <div className="mb-4">{icon}</div>
          <Typography variant="h6" className="futuristic-text mb-1 font-semibold">{title}</Typography>
          <Typography className="futuristic-subtext text-sm leading-snug font-medium">{desc}</Typography>
        </div>
      )}
    </motion.div>
  );
}

function StepCard({ label, done }) {
  return (
    <div className="futuristic-step-card flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="futuristic-step-icon" />
        <p className="futuristic-subtext text-sm font-medium">{label}</p>
      </div>
      {done && <div className="futuristic-step-icon-done" />}
    </div>
  );
}