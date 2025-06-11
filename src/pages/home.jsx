import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/router';
import CyberNavbar from '@/components/CyberNavbar';
import FuturisticLayout from '@/components/FuturisticLayout';
import AIAssistantChat from '@/components/AIAssistantChat';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Target, 
  BarChart3, 
  Globe, 
  Zap, 
  Brain, 
  Rocket, 
  Shield, 
  TrendingUp,
  MessageCircle,
  ChevronRight,
  Activity,
  Clock,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';

export default function HomePage() {
  const { user, profile } = useUser();
  const [showChat, setShowChat] = useState(false);
  const [stats, setStats] = useState({
    applicationsToday: 12,
    matchScore: 94,
    jobsScraped: 156,
    profileViews: 89
  });
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  if (!user) {
    return (
      <FuturisticLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="glass-card p-8 text-center">
            <div className="loading-pulse w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full mx-auto mb-4" />
            <p className="neon-text">Initializing AI Dashboard...</p>
          </div>
        </div>
      </FuturisticLayout>
    );
  }

  const quickActions = [
    {
      title: 'AI Resume Tailoring',
      description: 'Generate perfect resumes with AI precision',
      icon: Sparkles,
      href: '/ai-tailoring',
      gradient: 'from-purple-500 to-pink-500',
      stats: '94% Match Rate'
    },
    {
      title: 'Smart Job Scraper',
      description: 'Extract job details from any platform',
      icon: Globe,
      href: '/scraper',
      gradient: 'from-green-500 to-teal-500',
      stats: '156 Jobs Found'
    },
    {
      title: 'Auto-Fill Engine',
      description: 'Fill applications with 95% accuracy',
      icon: Zap,
      href: '/autofill',
      gradient: 'from-yellow-500 to-orange-500',
      stats: '12 Forms Today'
    },
    {
      title: 'Application Tracker',
      description: 'Monitor your job application pipeline',
      icon: BarChart3,
      href: '/applications',
      gradient: 'from-blue-500 to-cyan-500',
      stats: '8 In Progress'
    }
  ];

  const achievements = [
    { label: 'Resume Optimized', value: '100%', icon: CheckCircle2, color: 'green' },
    { label: 'Profile Complete', value: '95%', icon: Activity, color: 'blue' },
    { label: 'AI Training', value: '87%', icon: Brain, color: 'purple' },
    { label: 'Success Rate', value: '94%', icon: TrendingUp, color: 'cyan' }
  ];

  return (
    <FuturisticLayout>
      <CyberNavbar />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-6 cyber-heading"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
          >
            <span className="gradient-text">
              Welcome back, {profile?.name || user?.user_metadata?.full_name || user.email.split('@')[0]}
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-8 elegant-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Your AI-powered career acceleration platform is ready
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4 mb-8"
          >
            {achievements.map((achievement, index) => (
              <div key={index} className="glass-card p-4 text-center hover-lift">
                <achievement.icon className={`w-6 h-6 text-${achievement.color}-400 mx-auto mb-2`} />
                <div className={`text-2xl font-bold text-${achievement.color}-400`}>
                  {achievement.value}
                </div>
                <div className="text-xs text-gray-400">{achievement.label}</div>
              </div>
            ))}
          </motion.div>

          <Link href="/ai-tailoring">
            <motion.button
              className="cyber-button text-lg px-8 py-4 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Launch AI Copilot
              <ArrowUpRight className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Stats Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <div className="hologram-card p-6 text-center hover-lift">
            <Target className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
            <div className="text-3xl font-bold neon-text">{stats.applicationsToday}</div>
            <div className="text-gray-400 text-sm">Applications Today</div>
          </div>
          
          <div className="hologram-card p-6 text-center hover-lift">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-green-400">{stats.matchScore}%</div>
            <div className="text-gray-400 text-sm">AI Match Score</div>
          </div>
          
          <div className="hologram-card p-6 text-center hover-lift">
            <Globe className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-purple-400">{stats.jobsScraped}</div>
            <div className="text-gray-400 text-sm">Jobs Discovered</div>
          </div>
          
          <div className="hologram-card p-6 text-center hover-lift">
            <Activity className="w-8 h-8 text-orange-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-orange-400">{stats.profileViews}</div>
            <div className="text-gray-400 text-sm">Profile Views</div>
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-8 text-center gradient-text cyber-heading">
            AI-Powered Tools
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <motion.div
                  className="gradient-border p-8 hover-lift hover-glow cursor-pointer group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className={`p-4 rounded-2xl bg-gradient-to-r ${action.gradient} group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Performance</div>
                      <div className="text-lg font-bold text-cyan-400">{action.stats}</div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-cyan-400 transition-colors">
                    {action.title}
                  </h3>
                  
                  <p className="text-gray-400 mb-4 elegant-text">
                    {action.description}
                  </p>
                  
                  <div className="flex items-center text-cyan-400 group-hover:translate-x-2 transition-transform">
                    <span className="text-sm font-medium">Launch Tool</span>
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="glass-card p-8"
        >
          <h3 className="text-2xl font-bold mb-6 gradient-text">Recent Activity</h3>
          
          <div className="space-y-4">
            {[
              { action: 'Resume tailored for Software Engineer role', time: '2 minutes ago', status: 'success' },
              { action: 'Job scraped from LinkedIn', time: '15 minutes ago', status: 'processing' },
              { action: 'Application submitted to TechCorp', time: '1 hour ago', status: 'success' },
              { action: 'Profile optimization completed', time: '3 hours ago', status: 'success' }
            ].map((activity, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 + index * 0.1 }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full status-${activity.status}`} />
                  <span className="text-gray-300">{activity.action}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-500 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{activity.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Assistant Chat Button */}
      <motion.button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ 
          boxShadow: [
            '0 0 20px rgba(147, 51, 234, 0.5)', 
            '0 0 40px rgba(236, 72, 153, 0.8)', 
            '0 0 20px rgba(147, 51, 234, 0.5)'
          ] 
        }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <MessageCircle className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
      </motion.button>

      {/* AI Assistant Chat */}
      <AIAssistantChat isOpen={showChat} onClose={() => setShowChat(false)} />
    </FuturisticLayout>
  );
}