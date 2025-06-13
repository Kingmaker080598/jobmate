import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Globe, 
  Zap, 
  BarChart3, 
  Brain, 
  TrendingUp,
  ChevronRight,
  Activity,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  User,
  Target,
  FileText,
  Rocket
} from 'lucide-react';

export default function HomePage() {
  const { user, profile } = useUser();
  const [stats, setStats] = useState({
    resumesGenerated: 8,
    matchScore: 94,
    jobsScraped: 23,
    applicationsTracked: 12
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
      description: 'Generate perfect resumes with OpenAI precision',
      icon: Sparkles,
      href: '/ai-tailoring',
      gradient: 'from-purple-500 to-pink-500',
      stats: '94% Match Rate',
      primary: true
    },
    {
      title: 'Smart Job Scraper',
      description: 'Extract job details from any platform',
      icon: Globe,
      href: '/scraper',
      gradient: 'from-green-500 to-teal-500',
      stats: '23 Jobs Found'
    },
    {
      title: 'Smart Autofill',
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
    { label: 'AI Match Score', value: '94%', icon: Brain, color: 'purple' },
    { label: 'Profile Complete', value: '95%', icon: Activity, color: 'blue' },
    { label: 'Resumes Generated', value: '8', icon: FileText, color: 'green' },
    { label: 'Success Rate', value: '87%', icon: TrendingUp, color: 'cyan' }
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
            className="text-5xl md:text-6xl font-bold mb-6 text-gray-900"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
          >
            Welcome back, {profile?.name || user?.user_metadata?.full_name || user.email.split('@')[0]}
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-600 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Your AI-powered career acceleration platform
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-6 mb-8"
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
              <div className="flex items-center gap-3">
                <Rocket className="w-5 h-5" />
                Launch AI Copilot
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </motion.button>
          </Link>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">
            AI-Powered Tools
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <motion.div
                  className={`bg-white border border-gray-200 rounded-xl p-8 hover-lift cursor-pointer group transition-all duration-300 ${
                    action.primary ? 'ring-2 ring-purple-200 bg-gradient-to-br from-purple-50 to-pink-50' : ''
                  }`}
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
                  
                  <p className="text-gray-600 mb-4">
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
              { action: 'Application form auto-filled', time: '1 hour ago', status: 'success' },
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
                  <div className={`w-3 h-3 rounded-full ${
                    activity.status === 'success' ? 'bg-green-500' : 
                    activity.status === 'processing' ? 'bg-blue-500 animate-pulse' : 'bg-red-500'
                  }`} />
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
    </div>
  );
}