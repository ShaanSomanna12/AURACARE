import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/phc';
  const role = searchParams.get('role') ?? 'CUSTOMER_PHC';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Ensure the user has a profile with the correct role
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (!profile) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          role: role,
        });
      }
      
      // Determine where to redirect based on role
      const finalRole = profile?.role || role;
      if (finalRole === 'DOCTOR_ADMIN') {
        return NextResponse.redirect(`${origin}/hospital`);
      } else {
        return NextResponse.redirect(`${origin}/phc`);
      }
    }
  }


  // return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/login?error=OAuth_Failed`);
}
