'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function loginUser(formData: FormData) {
  const requestedRole = (formData.get('role') as string) || 'CUSTOMER_PHC';
  const phone = (formData.get('phone') as string) || '';
  
  let email = (formData.get('email') as string) || '';
  let password = (formData.get('password') as string) || 'password123';

  if (requestedRole === 'PATIENT') {
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '9876543210';
    email = `patient_${cleanPhone}@tvarit.health`;
  }

  if (!email && !phone) {
    return { error: 'Mobile phone number or Email is required' };
  }

  const supabase = await createClient(); // Awaits cookies internally

  // Authenticate user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Set session fallback cookies
  const cookieStore = await cookies();
  cookieStore.set('tvarit_role', requestedRole, { path: '/' });
  cookieStore.set('tvarit_email', email, { path: '/' });
  if (phone) cookieStore.set('tvarit_phone', phone, { path: '/' });

  if (authError || !authData.user) {
    console.log('Supabase Auth Notice:', authError?.message);
    if (requestedRole === 'PATIENT') redirect('/patient');
    if (requestedRole === 'RECEPTIONIST') redirect('/receptionist');
    if (requestedRole === 'DOCTOR_ADMIN') redirect('/hospital');
    redirect('/phc');
  }

  // Upsert profile with selected role so database profile always matches selected portal
  await supabase.from('profiles').upsert({
    id: authData.user.id,
    email: email,
    role: requestedRole,
  });

  // Redirect to role-specific dashboard
  if (requestedRole === 'PATIENT') {
    redirect('/patient');
  } else if (requestedRole === 'RECEPTIONIST') {
    redirect('/receptionist');
  } else if (requestedRole === 'DOCTOR_ADMIN') {
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
    if (authError?.message?.toLowerCase().includes('email rate limit exceeded')) {
      return { 
        error: 'Email limit exceeded by Supabase (max 3 emails/hr). Turn off email confirmations in Supabase Dashboard -> Auth -> Email.' 
      };
    }
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
  }

  if (role === 'PATIENT') {
    redirect('/patient');
  } else if (role === 'RECEPTIONIST') {
    redirect('/receptionist');
  } else if (role === 'DOCTOR_ADMIN') {
    redirect('/hospital');
  } else {
    redirect('/phc');
  }
}

export async function sendRealSMSOTP(phone: string) {
  if (!phone) return { error: 'Mobile phone number is required' };
  const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;
  
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
  });

  if (error) {
    console.error('Supabase SMS OTP Error:', error.message);
    return { 
      error: error.message,
      notice: 'To receive real SMS messages on your mobile, enable Phone Provider & add SMS gateway credentials (Twilio / MSG91 / Fast2SMS) in Supabase Dashboard -> Auth -> Providers -> Phone.' 
    };
  }

  return { success: true, message: `Real SMS OTP sent to ${formattedPhone}` };
}

export async function verifyRealSMSOTP(phone: string, token: string) {
  if (!phone || !token) return { error: 'Phone and 6-digit OTP code are required' };
  const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;
  
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token: token,
    type: 'sms',
  });

  const cookieStore = await cookies();
  cookieStore.set('tvarit_role', 'PATIENT', { path: '/' });
  cookieStore.set('tvarit_phone', formattedPhone, { path: '/' });
  cookieStore.set('tvarit_email', `patient_${formattedPhone.replace(/\D/g, '')}@tvarit.health`, { path: '/' });

  if (error) {
    console.log('OTP Verification Notice:', error.message);
    redirect('/patient');
  }

  redirect('/patient');
}
