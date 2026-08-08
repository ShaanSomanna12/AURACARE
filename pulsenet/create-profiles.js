const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const url = urlMatch[1].trim();
const key = keyMatch[1].trim();

const supabase = createClient(url, key);

async function createProfiles() {
  // 1. Get the users
  const { data: users, error } = await supabase.auth.signInWithPassword({ email: 'worker@test.com', password: 'password123' });
  if (users.user) {
    await supabase.from('profiles').upsert({ id: users.user.id, email: 'worker@test.com', role: 'CUSTOMER_PHC' });
    console.log("Worker profile created.");
  }
  
  const { data: dUsers } = await supabase.auth.signInWithPassword({ email: 'doctor@test.com', password: 'password123' });
  if (dUsers.user) {
    await supabase.from('profiles').upsert({ id: dUsers.user.id, email: 'doctor@test.com', role: 'DOCTOR_ADMIN' });
    console.log("Doctor profile created.");
  }

  // patient might have failed due to rate limit, let's try creating a new one: patient99@test.com
  const { data: pUsers, error: pErr } = await supabase.auth.signUp({ email: 'patient99@test.com', password: 'password123' });
  if (pUsers.user) {
    await supabase.from('profiles').upsert({ id: pUsers.user.id, email: 'patient99@test.com', role: 'PATIENT' });
    console.log("Patient99 profile created.");
  } else {
    console.log("Patient error:", pErr);
  }
}

createProfiles();
