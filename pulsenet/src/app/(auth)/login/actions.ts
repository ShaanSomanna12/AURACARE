'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function loginUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const supabase = await createClient(); // Awaits cookies internally

  // Authenticate user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { error: authError?.message || 'Authentication failed' };
  }

  // Fetch user role from profiles to determine redirect route
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single();

  if (profile?.role === 'DOCTOR_ADMIN') {
    redirect('/hospital');
  } else {
    redirect('/phc');
  }
}

export async function signUpUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  if (!email || !password || !role) {
    return { error: 'Email, password, and role are required' };
  }

  const supabase = await createClient();

  // Register user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { error: authError?.message || 'Registration failed' };
  }

  // Create the corresponding profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      email: authData.user.email,
      role: role,
    });

  if (profileError) {
    console.error('Profile creation error:', profileError);
    // Fallback: If RLS blocked insert, we might need a DB trigger in production.
    // But we still attempt to redirect.
  }

  if (role === 'DOCTOR_ADMIN') {
    redirect('/hospital');
  } else {
    redirect('/phc');
  }
}
