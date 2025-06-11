import CyberNavbar from '@/components/CyberNavbar';
import FuturisticLayout from '@/components/FuturisticLayout';
import RequireAuth from '@/components/RequireAuth';
import SmartAutofillEngine from '@/components/SmartAutofillEngine';

export default function AutofillPage() {
  return (
    <RequireAuth>
      <FuturisticLayout>
        <CyberNavbar />
        <SmartAutofillEngine />
      </FuturisticLayout>
    </RequireAuth>
  );
}