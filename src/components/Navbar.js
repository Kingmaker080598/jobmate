import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/router';
import LogoutIcon from '@mui/icons-material/Logout';
import { useUser } from '@/contexts/UserContext'; // ✅ Add this

export default function Navbar() {
  const router = useRouter();
  const { setProfile } = useUser(); // ✅ Access setProfile from context

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

        if (userData) setProfile(userData); // ✅ Safe update via context
      }
    };

    fetchProfile();
  }, [setProfile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <Link href="/home" className="text-xl font-bold">
        JobMate
      </Link>
      <div className="space-x-6 flex items-center">
        <Link href="/profile" className="hover:underline">
          Profile
        </Link>
        <Link href="/history" className="hover:underline">
          Resume History
        </Link>
        <button
          onClick={handleLogout}
          className="text-white hover:text-red-400 transition-transform hover:scale-110"
          title="Logout"
        >
          <LogoutIcon />
        </button>
      </div>
    </nav>
  );
}
