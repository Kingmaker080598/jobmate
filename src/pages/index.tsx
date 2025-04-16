// pages/index.js

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Typography, Button as MuiButton } from '@mui/material';
import { Rocket, FileText, Brain, ShieldCheck, Lightbulb, Clock, ClipboardCheck } from 'lucide-react';

// Premium Luxurious Futuristic CSS (aligned with home.js)
const futuristicStyles = `
  .futuristic-bg {
    background: linear-gradient(135deg, #0d0221 0%, #1a0b4e 50%, #2a1a6e 100%);
    min-height: 100vh;
    position: relative;
    overflow: hidden;
    color: #F5F5F5;
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
    background: linear-gradient(45deg, rgba(147, 51, 234, 0.1), rgba(255, 215, 0, 0.1));
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
  .futuristic-card {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid transparent;
    border-image: linear-gradient(90deg, #9333ea, #FFD700) 1;
    border-radius: 16px;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    padding: 24px;
    position: relative;
    z-index: 1;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .futuristic-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 30px rgba(255, 215, 0, 0.6);
  }
  .futuristic-button {
    background: linear-gradient(90deg, #FFD700, #DAA520);
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    color: #1e3a8a;
    font-weight: 600;
    text-transform: uppercase;
    font-family: 'Orbitron', sans-serif;
    transition: all 0.3s ease;
  }
  .futuristic-button:hover {
    background: linear-gradient(90deg, #DAA520, #FFD700);
    box-shadow: 0 0 12px rgba(255, 215, 0, 0.8);
  }
  .futuristic-text {
    color: #F5F5F5;
    text-shadow: 0 0 4px rgba(255, 215, 0, 0.3);
    font-family: 'Orbitron', sans-serif;
  }
  .futuristic-subtext {
    color: #F5F5F5;
    text-shadow: 0 0 6px rgba(255, 215, 0, 0.5);
    font-family: 'Roboto', sans-serif;
  }
  .futuristic-nav {
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 215, 0, 0.2);
    backdrop-filter: blur(10px);
  }
  .futuristic-link {
    color: #F5F5F5;
    transition: color 0.3s ease;
    font-family: 'Roboto', sans-serif;
  }
  .futuristic-link:hover {
    color: #FFD700;
    text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
  }
  .futuristic-icon {
    color: #FFD700;
    filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.6));
    animation: pulse-icon 2s infinite ease-in-out;
  }
  @keyframes pulse-icon {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;

export default function LandingPage() {
  return (
    <div className="futuristic-bg">
      <style>{futuristicStyles}</style>
      <div className="futuristic-starfield" />

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
              background: 'linear-gradient(90deg, #FFD700, #C0C0C0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 12px rgba(255, 215, 0, 0.7)',
            }}
          >
            AI-Powered Resume Mastery
          </Typography>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Typography
            className="futuristic-subtext text-lg max-w-2xl mx-auto mb-16 sm:mt-24 mt-16"
          >
            Transform your job hunt with JobMate’s intelligent tools. Upload once, shine everywhere.
          </Typography>
        </motion.div>
        <Link href="/login">
          <motion.div
            className="mt-16" // Added margin-top to the wrapper div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
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
          className="futuristic-text text-center font-semibold mb-16 sm:text-4xl text-3xl" // Increased mb-16
          style={{
            background: 'linear-gradient(90deg, #FFD700, #C0C0C0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 8px rgba(255, 215, 0, 0.5)',
          }}
        >
          How JobMate Works
        </Typography>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pt-4"> {/* Added pt-4 */}
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
              whileHover={{ scale: 1.05, rotate: 2 }}
            >
              <step.icon className="w-10 h-10 mx-auto mb-4 futuristic-icon" />
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
          className="futuristic-text font-semibold mb-48 sm:text-4xl text-3xl" // Increased mb-8 to mb-12
          style={{
            background: 'linear-gradient(90deg, #FFD700, #C0C0C0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 8px rgba(255, 215, 0, 0.5)',
          }}
        >
          Why Choose JobMate?
        </Typography>
        <div className="flex justify-center mb-8"> {/* Added flex and justify-center */}
          <Typography
            className="futuristic-subtext max-w-2xl text-lg text-center mt-16" // Added mt-8 to move it down
          >
            Elevate your career with AI that’s fast, precise, and designed for success. JobMate is your edge in the job market.
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-8">
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
              whileHover={{ scale: 1.05, rotate: 2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <feature.icon className="w-6 h-6 futuristic-icon" />
                <Typography className="futuristic-text text-xl font-semibold">
                  {feature.title}
                </Typography>
              </div>
              <Typography className="futuristic-subtext opacity-70">
                {feature.text}
              </Typography>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,215,0,0.2)] text-center py-6">
        <Typography className="futuristic-subtext text-sm opacity-70">
          JobMate © {new Date().getFullYear()} | Built with <span style={{ color: 'red' }}>❤️</span> for all job seekers, powered by AI
        </Typography>
      </footer>
    </div>
  );
}