import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/router';
import LogoutIcon from '@mui/icons-material/Logout';
import { useUser } from '@/contexts/UserContext';
import Image from 'next/image';
import { 
  Home, 
  Sparkles, 
  Briefcase, 
  Zap, 
  BarChart3, 
  User, 
  Clock,
  Settings
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
    { href: '/ai-tailoring', icon: Sparkles, label: 'AI Tailoring' },
    { href: '/jobs', icon: Briefcase, label: 'Job Board' },
    { href: '/autofill', icon: Zap, label: 'Smart Autofill' },
    { href: '/applications', icon: BarChart3, label: 'Applications' },
    { href: '/profile', icon: User, label: 'Profile' },
    { href: '/history', icon: Clock, label: 'History' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/home" className="flex items-center space-x-3">
            <Image
              src="/favicon-32x32.png"
              alt="JobMate Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-gray-900">
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
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
              <button className="text-gray-600 hover:text-gray-900">
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-50"
              title="Logout"
            >
              <LogoutIcon className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className="md:hidden border-t border-gray-200 py-2">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-xs transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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