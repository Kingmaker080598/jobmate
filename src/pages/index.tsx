import Link from 'next/link';
import { motion } from 'framer-motion';
import { Rocket, FileText, Brain, Lightbulb, Clock, ClipboardCheck, Sparkles, Zap, Target, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navbar */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <motion.div 
              className="flex items-center space-x-3 cursor-pointer group"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">JM</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
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
                Get Started
              </motion.button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-6 relative">
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
              <Sparkles className="w-16 h-16 text-blue-600" />
            </motion.div>
            <h1 className="text-6xl md:text-8xl font-bold text-gray-900 cyber-heading">
              AI-Powered Career Success
            </h1>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="w-16 h-16 text-purple-600" />
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto mb-16 elegant-text">
            Transform your job hunt with JobMate&apos;s intelligent AI. Upload once, dominate everywhere.
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
                Launch AI Platform
              </div>
            </motion.button>
          </Link>
          
          <motion.button
            className="bg-white border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 px-12 py-6 rounded-lg transition-colors text-xl"
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
            <div key={index} className="glass-card p-8 text-center hover-lift">
              <div className="text-4xl font-bold gradient-text mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
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
          <h2 className="text-5xl font-bold text-gray-900 cyber-heading mb-6">
            How JobMate Works
          </h2>
          <p className="text-xl text-gray-600 elegant-text">
            Four simple steps to career acceleration
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: FileText, title: 'Upload Resume', desc: 'Upload your master resume once', gradient: 'from-blue-500 to-cyan-500' },
            { icon: Brain, title: 'AI Analysis', desc: 'AI analyzes job requirements', gradient: 'from-purple-500 to-pink-500' },
            { icon: Zap, title: 'Smart Tailoring', desc: 'Generate perfect matches instantly', gradient: 'from-green-500 to-teal-500' },
            { icon: Target, title: 'Apply Smart', desc: 'Use autofill for faster applications', gradient: 'from-orange-500 to-red-500' },
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="bg-white border border-gray-200 rounded-lg p-8 text-center hover-lift"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.gradient} mx-auto mb-6 flex items-center justify-center`}>
                <step.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">{step.title}</h3>
              <p className="text-gray-600 elegant-text">{step.desc}</p>
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
          <h2 className="text-5xl font-bold text-gray-900 cyber-heading mb-6">
            Why Choose JobMate?
          </h2>
          <p className="text-xl text-gray-600 elegant-text max-w-3xl mx-auto">
            Elevate your career with AI that&apos;s fast, precise, and designed for success
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Sparkles,
              title: 'AI Resume Tailoring',
              text: 'Our AI crafts resumes that align perfectly with job descriptions, highlighting your strengths.',
              gradient: 'from-purple-500 to-pink-500'
            },
            {
              icon: Globe,
              title: 'Smart Job Scraping',
              text: 'Extract job details from any platform with our intelligent web scraper.',
              gradient: 'from-green-500 to-teal-500'
            },
            {
              icon: Zap,
              title: 'Intelligent Autofill',
              text: 'Fill application forms instantly with 95% accuracy using your saved profile.',
              gradient: 'from-yellow-500 to-orange-500'
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="bg-white border border-gray-200 rounded-lg p-8 hover-lift"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${feature.gradient} mb-6 flex items-center justify-center`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 elegant-text leading-relaxed">{feature.text}</p>
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
          <h2 className="text-5xl font-bold text-gray-900 cyber-heading mb-6">
            Ready to Accelerate Your Career?
          </h2>
          <p className="text-xl text-gray-600 mb-12 elegant-text">
            Join thousands of professionals who&apos;ve transformed their job search with AI
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
      <footer className="border-t border-gray-200 bg-white text-center py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">JM</span>
            </div>
            <span className="text-xl font-bold text-gray-900">JobMate</span>
          </div>
          <p className="text-gray-600 elegant-text mb-6">
            JobMate © {new Date().getFullYear()} | Built with ❤️ for job seekers, powered by AI
          </p>
          <div className="flex justify-center gap-8 text-sm">
            <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About</Link>
            <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</Link>
            <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}