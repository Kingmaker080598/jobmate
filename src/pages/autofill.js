import Navbar from '@/components/Navbar';
import RequireAuth from '@/components/RequireAuth';
import SmartAutofillEngine from '@/components/SmartAutofillEngine';

export default function AutofillPage() {
  return (
    <RequireAuth>
      <Navbar />
      <SmartAutofillEngine />
    </RequireAuth>
  );
}