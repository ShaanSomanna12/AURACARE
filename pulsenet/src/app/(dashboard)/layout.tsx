import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Activity, LogOut } from 'lucide-react';
import RoleNavigationHeader from '@/components/nav/RoleNavigationHeader';

import Image from 'next/image';
import DashboardProviderWrapper from '@/components/providers/DashboardProviderWrapper';

import { cookies } from 'next/headers';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  let userRole: string | undefined = undefined;
  let userEmail: string = 'demo@tvarit.health';

  if (user) {
    userEmail = user.email || 'user@test.com';
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name, facility_id')
      .eq('id', user.id)
      .single();
    userRole = profile?.role;
  } else {
    // Fallback for hackathon demo if Supabase email logins are disabled in Supabase Dashboard
    const cookieStore = await cookies();
    const fallbackRole = cookieStore.get('tvarit_role')?.value;
    const fallbackEmail = cookieStore.get('tvarit_email')?.value;
    if (!fallbackRole) {
      redirect('/login');
    }
    userRole = fallbackRole;
    if (fallbackEmail) userEmail = fallbackEmail;
  }

  const roleTitle = 
    userRole === 'PATIENT' ? 'Patient Portal' :
    userRole === 'CUSTOMER_PHC' ? 'PHC Worker Portal' :
    userRole === 'DOCTOR_ADMIN' ? 'Doctor Command Center' :
    userRole === 'RECEPTIONIST' ? 'Receptionist Portal' :
    'Health Portal';

  return (
    <DashboardProviderWrapper>
      <div className="min-h-screen bg-[#F0F9FF] text-slate-800 flex flex-col font-sans relative overflow-hidden">
        
        {/* Ambient Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(2,132,199,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(2,132,199,0.04)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        
        {/* Global Topbar */}
        <header className="h-16 border-b border-sky-100 bg-white/85 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50 shadow-[0_4px_20px_-5px_rgba(2,132,199,0.08)]">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#050811] shadow-[0_0_15px_rgba(236,72,153,0.35)] border border-pink-500/40 flex items-center justify-center">
              <Image src="/logo.png" alt="Tvarit Logo" width={52} height={52} className="object-cover scale-135" />
            </div>

            <div>
              <h1 className="font-['Lucida_Sans','Lucida_Grande','Lucida_Sans_Unicode',sans-serif] font-extrabold text-slate-800 text-lg tracking-tight flex items-center gap-2">
                TVARIT <span className="text-slate-300 font-sans font-normal">|</span> 
                <span className="text-[#0284C7] text-sm tracking-wider uppercase font-bold font-sans">
                  {roleTitle}
                </span>
              </h1>

            </div>
          </div>


          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{userEmail}</p>
              <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-sky-50 text-[#0284C7] border border-sky-200">
                {userRole || 'AUTHENTICATED'}
              </span>
            </div>

            
            <form action={async () => {
              'use server';
              const supabase = await createClient();
              await supabase.auth.signOut();
              const cookieStore = await cookies();
              cookieStore.delete('tvarit_role');
              cookieStore.delete('tvarit_email');
              redirect('/login');
            }}>
              <button 
                type="submit" 
                title="Sign Out to Change Account Role"
                className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-all border border-slate-200 hover:border-red-200 shadow-sm text-xs font-bold font-space flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </form>

          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 relative z-10 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>
    </DashboardProviderWrapper>
  );
}

