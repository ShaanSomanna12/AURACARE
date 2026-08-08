const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const url = urlMatch[1].trim();
const key = keyMatch[1].trim();

const supabase = createClient(url, key);

async function testAuth() {
  console.log("Testing SignIn...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'worker@test.com',
    password: 'password123'
  });
  
  if (error) {
    console.error("SignIn Error:", error.message);
  } else {
    console.log("SignIn Success:", data.user?.id);
  }
}

testAuth();
