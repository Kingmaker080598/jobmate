import Navbar from '@/components/Navbar';
import RequireAuth from '@/components/RequireAuth';
import ApplicationTracker from '@/components/ApplicationTracker';

export default function ApplicationsPage() {
  return (
    <RequireAuth>
      <Navbar />
      <ApplicationTracker />
    </RequireAuth>
  );
}