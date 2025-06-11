import Navbar from '@/components/Navbar';
import RequireAuth from '@/components/RequireAuth';
import WebScraperAssistant from '@/components/WebScraperAssistant';

export default function ScraperPage() {
  return (
    <RequireAuth>
      <Navbar />
      <WebScraperAssistant />
    </RequireAuth>
  );
}