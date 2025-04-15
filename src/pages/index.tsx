// pages/index.js

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Typography, Button as MuiButton } from '@mui/material';
import { Rocket, FileText, Brain, ShieldCheck, Sparkles, Lightbulb, Clock, ClipboardCheck } from 'lucide-react';

// Futuristic CSS (add to styles/globals.css or pages/LandingPage.css)
const futuristicStyles = `
  .futuristic-bg {
    background: linear-gradient(135deg, #0a0a23 0%, #1a1a4e 50%, #2a1a6e 100%);
    min-height: 100vh;
    position: relative;
    overflow: hidden;
    color: #d4d4ff;
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
    position: relative;
    z-index: 1;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .futuristic-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 30px rgba(147, 51, 234, 0.4);
  }
  .futuristic-button {
    background: linear-gradient(90deg, #9333ea, #3b82f6);
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    color: #fff;
    font-weight: 600;
    text-transform: uppercase;
    transition: all 0.3s ease;
  }
  .futuristic-button:hover {
    background: linear-gradient(90deg, #a855f7, #60a5fa);
    box-shadow: 0 0 12px rgba(147, 51, 234, 0.6);
  }
  .futuristic-text {
    color: #d4d4ff;
    text-shadow: 0 0 4px rgba(147, 51, 234, 0.3);
  }
  .futuristic-nav {
    background: rgba(20, 20, 50, 0.8);
    border-bottom: 1px solid rgba(147, 51, 234, 0.4);
    backdrop-filter: blur(10px);
  }
  .futuristic-link {
    color: #60a5fa;
    transition: color 0.3s ease;
  }
  .futuristic-link:hover {
    color: #a855f7;
  }
`;

export default function LandingPage() {
  return (
    <div className="futuristic-bg">
      <style>{futuristicStyles}</style>

      {/* Navbar */}
      <header className="futuristic-nav flex justify-between items-center px-8 py-4 sticky top-0 z-10">
        <Link href="/">
          <div className="flex items-center space-x-3 cursor-pointer">
            <Image src="/favicon.ico" alt="JobMate Logo" width={32} height={32} />
            <Typography className="futuristic-text text-2xl font-semibold">
              JobMate
            </Typography>
          </div>
        </Link>
        <div className="space-x-4">
          <Link href="/login">
            <MuiButton className="futuristic-button text-sm">Login</MuiButton>
          </Link>
          <Link href="/signup">
            <MuiButton className="futuristic-button text-sm">Sign Up</MuiButton>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-32 px-6 relative z-1">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h2"
            className="futuristic-text font-bold mb-6 sm:text-6xl text-4xl"
            style={{
              background: 'linear-gradient(90deg, #9333ea, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            AI-Powered Resume Mastery
          </Typography>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="futuristic-text text-lg opacity-70 max-w-2xl mb-8"
        >
          Transform your job hunt with JobMate’s intelligent resume tailoring. Upload once, shine everywhere.
        </motion.p>
        <Link href="/login">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <MuiButton className="futuristic-button text-lg px-8 py-3">
              Launch Now
            </MuiButton>
          </motion.div>
        </Link>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 max-w-6xl mx-auto">
        <Typography
          variant="h3"
          className="futuristic-text text-center font-semibold mb-16 sm:text-4xl text-3xl"
        >
          How JobMate Works
        </Typography>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: FileText, text: 'Upload Resume' },
            { icon: Brain, text: 'Add Job Description' },
            { icon: Rocket, text: 'Generate Resume' },
            { icon: ShieldCheck, text: 'Track Applications' },
          ].map((step, index) => (
            <motion.div
              key={index}
              className="futuristic-card text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <step.icon className="w-10 h-10 mx-auto mb-4" style={{ color: '#9333ea', filter: 'drop-shadow(0 0 4px rgba(147, 51, 234, 0.6))' }} />
              <Typography className="futuristic-text font-medium">
                {step.text}
              </Typography>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature Teaser Section */}
      <section className="py-24 px-6 text-center relative z-1">
        <Typography
          variant="h3"
          className="futuristic-text font-semibold mb-6 sm:text-4xl text-3xl"
        >
          Why Choose JobMate?
        </Typography>
        <Typography className="futuristic-text max-w-2xl mx-auto mb-12 opacity-70">
          Elevate your career with AI that’s fast, precise, and designed for success. JobMate is your edge in the job market.
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: Lightbulb,
              title: 'Intelligent Tailoring',
              text: 'Our AI crafts resumes that align perfectly with job descriptions, highlighting your strengths.',
            },
            {
              icon: Clock,
              title: 'Time Efficiency',
              text: 'Skip hours of editing. Get polished, job-ready resumes in moments.',
            },
            {
              icon: ClipboardCheck,
              title: 'Organized Tracking',
              text: 'Monitor your applications and resume history in a sleek, unified dashboard.',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="futuristic-card text-left"
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <feature.icon className="w-6 h-6" style={{ color: '#9333ea' }} />
                <Typography className="futuristic-text text-xl font-semibold">
                  {feature.title}
                </Typography>
              </div>
              <Typography className="futuristic-text opacity-70">
                {feature.text}
              </Typography>
            </motion.div>
          ))}
        </div>
        <motion.div
          className="flex justify-center mt-12"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-10 h-10" style={{ color: '#9333ea', filter: 'drop-shadow(0 0 4px rgba(147, 51, 234, 0.6))' }} />
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(147,51,234,0.4)] text-center py-6">
        <Typography className="futuristic-text text-sm opacity-70">
          JobMate © {new Date().getFullYear()}
        </Typography>
      </footer>
    </div>
  );
}