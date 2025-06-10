import Navbar from '@/components/Navbar';
import RequireAuth from '@/components/RequireAuth';
import AutoApplyDashboard from '@/components/AutoApplyDashboard';

export default function AutoApplyPage() {
  return (
    <RequireAuth>
      <Navbar />
      <AutoApplyDashboard />
    </RequireAuth>
  );
}