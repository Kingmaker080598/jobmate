import Navbar from '@/components/Navbar';
import RequireAuth from '@/components/RequireAuth';
import JobBoard from '@/components/JobBoard';

export default function JobsPage() {
  return (
    <RequireAuth>
      <Navbar />
      <JobBoard />
    </RequireAuth>
  );
}