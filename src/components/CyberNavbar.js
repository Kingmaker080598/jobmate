import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { 
  Home, 
  Search, 
  Target, 
  BarChart3, 
  User, 
  Clock,
  Settings,
  Sparkles,
  Globe,
  Zap,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function CyberNavbar() {
  const router = useRouter();
  const { setProfile } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('name')
          .eq('id', session.user.id)
          .maybeSingle();

        if (userData) setProfile(userData);
      }
    };

    fetchProfile();

    // Update time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [setProfile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navItems = [
    { href: '/home', icon: Home, label: 'Dashboard', color: 'cyan' },
    { href: '/jobs', icon: Search, label: 'Jobs', color: 'blue' },
    { href: '/ai-tailoring', icon: Sparkles, label: 'AI Tailoring', color: 'purple' },
    { href: '/scraper', icon: Globe, label: 'Scraper', color: 'green' },
    { href: '/autofill', icon: Zap, label: 'Autofill', color: 'yellow' },
    { href: '/auto-apply', icon: Target, label: 'Auto-Apply', color: 'orange' },
    { href: '/applications', icon: BarChart3, label: 'Applications', color: 'pink' },
    { href: '/profile', icon: User, label: 'Profile', color: 'indigo' },
    { href: '/history', icon: Clock, label: 'History', color: 'teal' },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="glass-card sticky top-0 z-50 mx-4 mt-4 rounded-2xl"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/home" className="flex items-center space-x-3 group">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center relative overflow-hidden">
                <span className="text-white font-bold text-lg relative z-10">JM</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                  initial={{ x: '100%' }}
                  whileHover={{ x: '0%' }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="absolute inset-0 bg-cyan-400 rounded-xl blur-lg opacity-30 group-hover:opacity-60 transition-opacity" />
            </motion.div>
            <div className="hidden sm:block">
              <span className="text-2xl font-bold gradient-text cyber-heading">
                JobMate
              </span>
              <div className="text-xs text-cyan-400 font-mono">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 relative group ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-xl border border-cyan-400/30"
                        layoutId="activeTab"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity bg-gradient-to-r from-${item.color}-400 to-${item.color}-600`} />
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Status Indicator */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-400 font-mono">ONLINE</span>
            </div>

            {/* Logout Button */}
            <motion.button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors duration-200 p-2 rounded-lg hover:bg-red-500/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Logout</span>
            </motion.button>

            {/* Mobile Menu Toggle */}
            <motion.button
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <motion.div
          initial={false}
          animate={{ height: isMenuOpen ? 'auto' : 0, opacity: isMenuOpen ? 1 : 0 }}
          className="lg:hidden overflow-hidden"
        >
          <div className="py-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Cyber Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10 pointer-events-none" />
    </motion.nav>
  );
}