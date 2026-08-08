import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import RealtimeDashboardFeed from '@/components/doctor/RealtimeDashboardFeed';
import { revalidatePath } from 'next/cache';
import { generatePreArrivalBriefing } from '@/lib/ai/gemini';

export default async function HospitalPortal() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Strict RBAC Verification
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, facility_id')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'DOCTOR_ADMIN') {
    redirect('/phc'); // Route them to PHC portal if they aren't a doctor
  }

  if (!profile.facility_id) {
    return (
      <div className="p-8 text-center glass-card rounded-xl border border-[var(--color-triage-red)]/50">
        <h2 className="text-xl text-[var(--color-triage-red)] font-bold">Configuration Error</h2>
        <p className="text-white/60 mt-2">Your doctor profile is not linked to a facility. Please contact an administrator.</p>
      </div>
    );
  }

  // Fetch incoming referrals for this facility
  const { data: referrals } = await supabase
    .from('referrals')
    .select('*')
    .eq('target_facility_id', profile.facility_id)
    .order('created_at', { ascending: false });

  // Server Action to handle acceptance and AI Generation
  async function acceptReferral(id: string) {
    'use server';
    const supabase = await createClient();
    
    // The PostgreSQL trigger decrement_blood_on_acceptance handles the concurrency logic!
    const { error, data: updatedReferrals } = await supabase
      .from('referrals')
      .update({ status: 'ACCEPTED', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'PENDING')
      .select('*'); // Select the updated row to pass to AI
      
    if (error || !updatedReferrals || updatedReferrals.length === 0) {
      console.error('Failed to accept referral:', error);
      return { success: false, briefing: null };
    }
    
    // Generate AI Pre-Arrival Briefing
    const briefing = await generatePreArrivalBriefing(updatedReferrals[0]);
    
    revalidatePath('/hospital');
    return { success: true, briefing };
  }

  return (
    <div className="w-full flex flex-col pt-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-space font-bold text-white mb-1">Incoming Emergency Queue</h2>
          <p className="text-white/60 font-sans text-sm">Live stream of incoming patient transfers from PHC units.</p>
        </div>
        <div className="bg-[var(--color-triage-red)]/10 text-[var(--color-triage-red)] border border-[var(--color-triage-red)]/20 px-4 py-2 rounded-lg font-space font-bold text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
          <div className="w-2 h-2 rounded-full bg-[var(--color-triage-red)] animate-pulse" />
          LIVE MONITORING ACTIVE
        </div>
      </div>

      <RealtimeDashboardFeed initialReferrals={referrals || []} onAccept={acceptReferral} facilityId={profile.facility_id} />
    </div>
  );
}
