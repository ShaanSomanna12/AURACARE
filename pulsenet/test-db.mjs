import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function run() {
  console.log("Testing basic connection to Supabase...");
  
  // We can query the public 'facilities' table using just the anon key
  const { data, error } = await supabase.from('facilities').select('*');
  
  if (error) {
    console.log("❌ Connection Error:", error.message);
  } else {
    console.log("✅ SUCCESS! Next.js is officially connected to Supabase.");
    console.log("✅ Successfully queried the 'facilities' table. Total rows:", data.length);
  }
}
run();
