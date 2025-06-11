import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Typography, Button as MuiButton } from '@mui/material';
import { Rocket, FileText, Brain, ShieldCheck, Lightbulb, Clock, ClipboardCheck, Sparkles, Zap, Target } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import FuturisticLayout from '@/components/FuturisticLayout';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/home');
      }
    };
    checkSession();
  }, [router]);

  return (
    <FuturisticLayout>
      {/* Navbar */}
      <header className="glass-card flex justify-between items-center px-8 py-4 sticky top-4 z-10 mx-4 rounded-2xl">
        <Link href="/">
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer group"
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">JM</span>
              </div>
              <div className="absolute inset-0 bg-cyan-400 rounded-xl blur-lg opacity-30 group-hover:opacity-60 transition-opacity" />
            </div>
            <span className="text-2xl font-bold gradient-text cyber-heading">
              JobMate
            </span>
          </motion.div>
        </Link>
        <div className="space-x-4">
          <Link href="/login">
            <motion.button 
              className="cyber-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Launch Platform
            </motion.button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-32 px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-6 mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-16 h-16 text-cyan-400" />
            </motion.div>
            <h1 className="text-6xl md:text-8xl font-bold gradient-text cyber-heading">
              AI-Powered Career Mastery
            </h1>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="w-16 h-16 text-purple-400" />
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <p className="text-2xl text-gray-300 max-w-4xl mx-auto mb-16 elegant-text">
            Transform your job hunt with JobMate's intelligent AI copilot. Upload once, dominate everywhere.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 mb-16"
        >
          <Link href="/login">
            <motion.button
              className="cyber-button text-xl px-12 py-6 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-3">
                <Rocket className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                Launch AI Copilot
              </div>
            </motion.button>
          </Link>
          
          <motion.button
            className="glass-card px-12 py-6 border border-cyan-400/50 hover:border-cyan-400 transition-colors text-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              Watch Demo
            </div>
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          {[
            { number: '94%', label: 'Match Rate Improvement' },
            { number: '10x', label: 'Faster Applications' },
            { number: '50K+', label: 'Jobs Processed' }
          ].map((stat, index) => (
            <div key={index} className="hologram-card p-8 text-center">
              <div className="text-4xl font-bold gradient-text mb-2">{stat.number}</div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold gradient-text cyber-heading mb-6">
            How JobMate AI Works
          </h2>
          <p className="text-xl text-gray-300 elegant-text">
            Four simple steps to career acceleration
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: FileText, title: 'Upload Resume', desc: 'Upload your master resume once', gradient: 'from-blue-500 to-cyan-500' },
            { icon: Brain, title: 'AI Analysis', desc: 'AI analyzes job requirements', gradient: 'from-purple-500 to-pink-500' },
            { icon: Zap, title: 'Smart Tailoring', desc: 'Generate perfect matches instantly', gradient: 'from-green-500 to-teal-500' },
            { icon: Target, title: 'Auto-Apply', desc: 'Apply to jobs automatically', gradient: 'from-orange-500 to-red-500' },
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="gradient-border p-8 text-center hover-lift"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.gradient} mx-auto mb-6 flex items-center justify-center`}>
                <step.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 gradient-text">{step.title}</h3>
              <p className="text-gray-400 elegant-text">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold gradient-text cyber-heading mb-6">
            Why Choose JobMate?
          </h2>
          <p className="text-xl text-gray-300 elegant-text max-w-3xl mx-auto">
            Elevate your career with AI that's fast, precise, and designed for success. JobMate is your edge in the job market.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Lightbulb,
              title: 'Intelligent AI Tailoring',
              text: 'Our AI crafts resumes that align perfectly with job descriptions, highlighting your strengths.',
              gradient: 'from-yellow-500 to-orange-500'
            },
            {
              icon: Clock,
              title: 'Lightning Speed',
              text: 'Skip hours of editing. Get polished, job-ready resumes in moments.',
              gradient: 'from-blue-500 to-purple-500'
            },
            {
              icon: ClipboardCheck,
              title: 'Smart Tracking',
              text: 'Monitor your applications and resume history in a sleek, unified dashboard.',
              gradient: 'from-green-500 to-teal-500'
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="gradient-border p-8 hover-lift"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${feature.gradient} mb-6 flex items-center justify-center`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 gradient-text">{feature.title}</h3>
              <p className="text-gray-400 elegant-text leading-relaxed">{feature.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-16 max-w-4xl mx-auto"
        >
          <h2 className="text-5xl font-bold gradient-text cyber-heading mb-6">
            Ready to Accelerate Your Career?
          </h2>
          <p className="text-xl text-gray-300 mb-12 elegant-text">
            Join thousands of professionals who've transformed their job search with AI
          </p>
          <Link href="/login">
            <motion.button
              className="cyber-button text-xl px-12 py-6"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-3">
                <Rocket className="w-6 h-6" />
                Start Your AI Journey
              </div>
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 text-center py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">JM</span>
            </div>
            <span className="text-xl font-bold gradient-text">JobMate</span>
          </div>
          <p className="text-gray-400 elegant-text mb-6">
            JobMate © {new Date().getFullYear()} | Built with ❤️ for all job seekers, powered by AI
          </p>
          <div className="flex justify-center gap-8 text-sm">
            <Link href="/about" className="text-gray-400 hover:text-cyan-400 transition-colors">About</Link>
            <Link href="/contact" className="text-gray-400 hover:text-cyan-400 transition-colors">Contact</Link>
            <Link href="/privacy" className="text-gray-400 hover:text-cyan-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-gray-400 hover:text-cyan-400 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </FuturisticLayout>
  );
}