import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/router';
import LogoutIcon from '@mui/icons-material/Logout';
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
  Zap
} from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const { setProfile } = useUser();

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
  }, [setProfile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navItems = [
    { href: '/home', icon: Home, label: 'Dashboard' },
    { href: '/jobs', icon: Search, label: 'Jobs' },
    { href: '/ai-tailoring', icon: Sparkles, label: 'AI Tailoring' },
    { href: '/scraper', icon: Globe, label: 'Scraper' },
    { href: '/autofill', icon: Zap, label: 'Autofill' },
    { href: '/auto-apply', icon: Target, label: 'Auto-Apply' },
    { href: '/applications', icon: BarChart3, label: 'Applications' },
    { href: '/profile', icon: User, label: 'Profile' },
    { href: '/history', icon: Clock, label: 'History' },
  ];

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 text-white shadow-lg border-b border-blue-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/home" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">JM</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              JobMate
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu & Logout */}
          <div className="flex items-center space-x-4">
            {/* Mobile Navigation */}
            <div className="md:hidden">
              <button className="text-gray-300 hover:text-white">
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-800"
              title="Logout"
            >
              <LogoutIcon className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className="md:hidden border-t border-gray-700 py-2">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="w-3 h-3" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}