'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, MapPin, Activity, CheckCircle2, AlertTriangle, PhoneCall } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function PatientDashboard() {
  const [symptoms, setSymptoms] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const supabase = createClient();

  const handleEmergencyRequest = async () => {
    if (!symptoms || !location) return;
    setIsSubmitting(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      alert("Authentication error");
      setIsSubmitting(false);
      return;
    }

    // Auto-triage logic based on keywords
    let priority = 'GREEN';
    const text = symptoms.toLowerCase();
    if (text.includes('heart') || text.includes('bleeding') || text.includes('unconscious') || text.includes('trauma')) {
      priority = 'RED';
    } else if (text.includes('fracture') || text.includes('pain') || text.includes('broken')) {
      priority = 'YELLOW';
    }

    // Insert referral to FAC-001 (Command Center) for Hackathon demo
    const { error } = await supabase.from('referrals').insert({
      patient_name: userData.user.email?.split('@')[0] || 'Unknown Patient',
      referrer_id: userData.user.id,
      target_facility_id: 'FAC-001',
      triage_status: priority,
      symptoms: `${symptoms} (Location: ${location})`,
      requested_blood_type: null,
      requested_blood_units: 0,
      status: 'PENDING',
    });

    if (error) {
      console.error(error);
      alert("Failed to send request.");
    } else {
      setSubmitted(true);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#F0F9FF] p-4 sm:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-[#0284C7]/10 p-3 rounded-2xl">
              <Activity className="w-8 h-8 text-[#0284C7]" />
            </div>
            <div>
              <h1 className="text-2xl font-space font-bold text-slate-800">Tvarit Patient Portal</h1>
              <p className="text-slate-500 font-medium">Emergency Response Network</p>
            </div>
          </div>
          <button 
            onClick={() => supabase.auth.signOut().then(() => window.location.href='/login')}
            className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Sign Out
          </button>
        </header>

        {/* Main Action Area */}
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-lg border border-red-100 overflow-hidden"
            >
              <div className="bg-red-50 p-6 sm:p-8 border-b border-red-100">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <h2 className="text-2xl font-bold text-red-700">Request Emergency Help</h2>
                </div>
                <p className="text-red-600/80 font-medium">
                  Your request will be sent directly to the nearest available hospital. Please provide accurate details.
                </p>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">What is the emergency?</label>
                  <textarea 
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-red-300 focus:ring-4 focus:ring-red-50 rounded-2xl px-4 py-4 text-slate-800 outline-none min-h-[120px] transition-all font-medium"
                    placeholder="e.g. Severe chest pain, breathing difficulty..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Current Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-red-300 focus:ring-4 focus:ring-red-50 rounded-2xl py-4 pl-12 pr-4 text-slate-800 outline-none transition-all font-medium"
                      placeholder="e.g. 123 Main St, Apt 4B"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleEmergencyRequest}
                  disabled={isSubmitting || !symptoms || !location}
                  className="w-full py-5 bg-red-500 hover:bg-red-600 text-white font-space font-bold text-lg rounded-2xl shadow-[0_8px_20px_rgba(239,68,68,0.3)] hover:shadow-[0_8px_25px_rgba(239,68,68,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <PhoneCall className="w-6 h-6" />
                      DISPATCH AMBULANCE
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-lg border border-green-100 p-8 sm:p-12 text-center"
            >
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }} 
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </motion.div>
              <h2 className="text-3xl font-space font-bold text-slate-800 mb-3">Help is on the way!</h2>
              <p className="text-slate-500 font-medium text-lg mb-8 max-w-md mx-auto">
                Your emergency request has been received by City General Hospital. An ambulance has been dispatched to your location.
              </p>
              
              <div className="bg-[#F0F9FF] rounded-2xl p-6 border border-[#0284C7]/20 inline-block text-left mb-8">
                <h3 className="font-bold text-[#0284C7] uppercase text-sm tracking-wider mb-4">Instructions</h3>
                <ul className="space-y-3 text-slate-700 font-medium">
                  <li className="flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-red-500" /> Stay calm and stay where you are.</li>
                  <li className="flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-red-500" /> Do not move if you suspect spinal injury.</li>
                  <li className="flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-red-500" /> Keep your phone line clear.</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
