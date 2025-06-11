import CyberNavbar from '@/components/CyberNavbar';
import FuturisticLayout from '@/components/FuturisticLayout';
import RequireAuth from '@/components/RequireAuth';
import AIResumeTailoringCopilot from '@/components/AIResumeTailoringCopilot';

export default function AITailoringPage() {
  return (
    <RequireAuth>
      <FuturisticLayout>
        <CyberNavbar />
        <AIResumeTailoringCopilot />
      </FuturisticLayout>
    </RequireAuth>
  );
}