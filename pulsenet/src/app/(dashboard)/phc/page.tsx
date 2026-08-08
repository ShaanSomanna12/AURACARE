import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TriageWizard from '@/components/triage/TriageWizard';

export default async function PHCPortal() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Strict RBAC Verification
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'CUSTOMER_PHC') {
    redirect('/hospital'); // Route them to their correct portal if they are a doctor
  }

  return (
    <div className="w-full flex flex-col items-center pt-8">
      <div className="w-full max-w-2xl mb-6 text-center">
        <h2 className="text-2xl font-space font-bold text-white mb-2">Initiate Emergency Transfer</h2>
        <p className="text-white/60 font-sans">Complete the triage protocol below to locate the nearest available facility with required blood units.</p>
      </div>

      <TriageWizard />
    </div>
  );
}
