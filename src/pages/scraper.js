import CyberNavbar from '@/components/CyberNavbar';
import FuturisticLayout from '@/components/FuturisticLayout';
import RequireAuth from '@/components/RequireAuth';
import WebScraperAssistant from '@/components/WebScraperAssistant';

export default function ScraperPage() {
  return (
    <RequireAuth>
      <FuturisticLayout>
        <CyberNavbar />
        <WebScraperAssistant />
      </FuturisticLayout>
    </RequireAuth>
  );
}