const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const url = urlMatch[1].trim();
const key = keyMatch[1].trim();

const supabase = createClient(url, key);

async function createTestUsers() {
  console.log("Attempting to create Patient...");
  const p1 = await supabase.auth.signUp({ email: 'patient@test.com', password: 'password123' });
  console.log("Patient:", p1.error ? p1.error.message : "Success");

  console.log("Attempting to create Worker...");
  const p2 = await supabase.auth.signUp({ email: 'worker@test.com', password: 'password123' });
  console.log("Worker:", p2.error ? p2.error.message : "Success");

  console.log("Attempting to create Doctor...");
  const p3 = await supabase.auth.signUp({ email: 'doctor@test.com', password: 'password123' });
  console.log("Doctor:", p3.error ? p3.error.message : "Success");
}

createTestUsers();
