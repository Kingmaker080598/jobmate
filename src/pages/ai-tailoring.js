import Navbar from '@/components/Navbar';
import RequireAuth from '@/components/RequireAuth';
import AIResumeTailoringCopilot from '@/components/AIResumeTailoringCopilot';

export default function AITailoringPage() {
  return (
    <RequireAuth>
      <Navbar />
      <AIResumeTailoringCopilot />
    </RequireAuth>
  );
}