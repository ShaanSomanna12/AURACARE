import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Activity, LogOut } from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Fetch the role for the UI display
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, facility_id')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-[var(--color-obsidian)] flex flex-col">
      {/* Global Topbar */}
      <header className="h-16 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-[var(--color-cyan-glow)]" />
          <h1 className="font-space font-bold text-white tracking-widest uppercase">TVARIT <span className="text-white/30">|</span> {profile?.role === 'DOCTOR_ADMIN' ? 'HOSPITAL COMMAND' : 'FIELD TRIAGE'}</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white">{profile?.full_name}</p>
            <p className="text-xs text-[var(--color-cyan-glow)] font-mono uppercase tracking-widest">{profile?.facility_id || 'Mobile Unit'}</p>
          </div>
          
          <form action={async () => {
            'use server';
            const supabase = await createClient();
            await supabase.auth.signOut();
            redirect('/login');
          }}>
            <button type="submit" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-[var(--color-triage-red)] transition-colors border border-white/5">
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 relative">
        {/* Background ambient lighting */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-electric-indigo)]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-cyan-glow)]/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
