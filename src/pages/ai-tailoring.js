import CyberNavbar from '@/components/CyberNavbar';
import FuturisticLayout from '@/components/FuturisticLayout';
import RequireAuth from '@/components/RequireAuth';
import AIResumeTailoringCopilot from '@/components/AIResumeTailoringCopilot';

export default function AITailoringPage() {
  return (
    <RequireAuth>
      <CyberNavbar />
      <FuturisticLayout
        title="AI Resume Tailoring"
        subtitle="Transform your resume with AI-powered optimization for any job posting"
      >
        <AIResumeTailoringCopilot />
      </FuturisticLayout>
    </RequireAuth>
  );
}