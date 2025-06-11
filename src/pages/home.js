import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
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
  ArrowUpRight,
  User
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.h1 
            className="text-6xl md:text-7xl font-bold mb-6 cyber-heading text-gray-900"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
          >
            Welcome back, {profile?.name || user?.user_metadata?.full_name || user.email.split('@')[0]}
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-600 mb-8 elegant-text"
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
                <achievement.icon className={`w-6 h-6 text-${achievement.color}-600 mx-auto mb-2`} />
                <div className={`text-2xl font-bold text-${achievement.color}-600`}>
                  {achievement.value}
                </div>
                <div className="text-xs text-gray-500">{achievement.label}</div>
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
          <div className="glass-card p-6 text-center hover-lift">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-blue-600">{stats.applicationsToday}</div>
            <div className="text-gray-500 text-sm">Applications Today</div>
          </div>
          
          <div className="glass-card p-6 text-center hover-lift">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-green-600">{stats.matchScore}%</div>
            <div className="text-gray-500 text-sm">AI Match Score</div>
          </div>
          
          <div className="glass-card p-6 text-center hover-lift">
            <Globe className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-purple-600">{stats.jobsScraped}</div>
            <div className="text-gray-500 text-sm">Jobs Discovered</div>
          </div>
          
          <div className="glass-card p-6 text-center hover-lift">
            <Activity className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-orange-600">{stats.profileViews}</div>
            <div className="text-gray-500 text-sm">Profile Views</div>
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 cyber-heading">
            AI-Powered Tools
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <motion.div
                  className="bg-white border border-gray-200 rounded-lg p-8 hover-lift cursor-pointer group"
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
                      <div className="text-sm text-gray-500">Performance</div>
                      <div className="text-lg font-bold text-blue-600">{action.stats}</div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors text-gray-900">
                    {action.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 elegant-text">
                    {action.description}
                  </p>
                  
                  <div className="flex items-center text-blue-600 group-hover:translate-x-2 transition-transform">
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
          <h3 className="text-2xl font-bold mb-6 text-gray-900">Recent Activity</h3>
          
          <div className="space-y-4">
            {[
              { action: 'Resume tailored for Software Engineer role', time: '2 minutes ago', status: 'success' },
              { action: 'Job scraped from LinkedIn', time: '15 minutes ago', status: 'processing' },
              { action: 'Application submitted to TechCorp', time: '1 hour ago', status: 'success' },
              { action: 'Profile optimization completed', time: '3 hours ago', status: 'success' }
            ].map((activity, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 + index * 0.1 }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full status-${activity.status}`} />
                  <span className="text-gray-700">{activity.action}</span>
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

      {/* AI Assistant Chat - Import and use the component when needed */}
      {showChat && (
        <div className="fixed bottom-24 right-8 w-96 h-[600px] bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">JobMate AI Assistant</h3>
              <button onClick={() => setShowChat(false)} className="text-white hover:text-gray-200">
                ×
              </button>
            </div>
          </div>
          <div className="p-4 h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Brain className="w-12 h-12 mx-auto mb-4 text-purple-500" />
              <p>AI Assistant coming soon!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}