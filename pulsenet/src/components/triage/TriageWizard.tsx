'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft, ShieldAlert, Activity, CheckCircle2 } from 'lucide-react';
import type { BloodType, TriageLevel, Facility } from '@/lib/types/database.types';
import BloodToggle from './BloodToggle';
import FacilityMap from '../map/FacilityMap';
import { createClient } from '@/lib/supabase/client';

export default function TriageWizard() {
  const [step, setStep] = useState(1);
  const [patientName, setPatientName] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [priority, setPriority] = useState<TriageLevel>('GREEN');
  const [bloodType, setBloodType] = useState<BloodType | null>(null);
  const [units, setUnits] = useState(1);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const supabase = createClient();

  const loadFacilities = async () => {
    const { data } = await supabase.from('facilities').select('*');
    if (data) setFacilities(data);
    nextStep();
  };

  const submitReferral = async (facilityId: string) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    
    // Create new referral record
    await supabase.from('referrals').insert({
      patient_name: patientName || 'Unknown Patient',
      referrer_id: userData.user.id,
      target_facility_id: facilityId,
      triage_status: priority,
      symptoms,
      requested_blood_type: bloodType,
      requested_blood_units: bloodType ? units : 0,
    });
    
    // Reset to step 1
    alert('Referral Transmitted Successfully!');
    setStep(1);
    setPatientName('');
    setSymptoms('');
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // Auto-calculate priority based on symptoms (mock logic for hackathon)
  const calculatePriority = () => {
    const text = symptoms.toLowerCase();
    if (text.includes('trauma') || text.includes('bleeding') || text.includes('unconscious')) {
      setPriority('RED');
    } else if (text.includes('fracture') || text.includes('pain')) {
      setPriority('YELLOW');
    } else {
      setPriority('GREEN');
    }
    nextStep();
  };

  return (
    <div className="w-full max-w-2xl mx-auto glass-card rounded-xl overflow-hidden shadow-2xl border border-white/10">
      {/* Header */}
      <div className="bg-black/40 p-4 flex items-center justify-between border-b border-white/5">
        <h2 className="text-xl font-space font-semibold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-[var(--color-cyan-glow)]" />
          Emergency Triage Protocol
        </h2>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`h-1.5 w-8 rounded-full ${s <= step ? 'bg-[var(--color-electric-indigo)]' : 'bg-white/10'}`} />
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="p-6 min-h-[400px] relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2 font-space">Patient Name / Identifier</label>
                <input 
                  type="text" 
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-black/30 border-b border-white/20 focus:border-[var(--color-cyan-glow)] px-4 py-3 text-white outline-none transition-colors"
                  placeholder="e.g. John Doe / ID-4592"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2 font-space">Chief Complaint & Symptoms</label>
                <textarea 
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full bg-black/30 border-b border-white/20 focus:border-[var(--color-cyan-glow)] px-4 py-3 text-white outline-none min-h-[100px] transition-colors"
                  placeholder="Describe trauma, vital signs..."
                />
              </div>
              <button 
                onClick={calculatePriority}
                className="w-full py-4 bg-[var(--color-electric-indigo)] hover:bg-[var(--color-electric-indigo)]/80 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 mt-4"
              >
                Analyze & Determine Priority <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center space-y-8 py-8"
            >
              <h3 className="text-white/70 font-space tracking-widest uppercase text-sm">Calculated Priority Level</h3>
              
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }} 
                transition={{ repeat: Infinity, duration: priority === 'RED' ? 1 : 3 }}
                className={`w-32 h-32 rounded-full flex items-center justify-center border-4 shadow-[0_0_30px_rgba(0,0,0,0.5)]
                  ${priority === 'RED' ? 'border-[var(--color-triage-red)] text-[var(--color-triage-red)] shadow-[var(--color-triage-red)]/20' : 
                    priority === 'YELLOW' ? 'border-[var(--color-triage-yellow)] text-[var(--color-triage-yellow)] shadow-[var(--color-triage-yellow)]/20' : 
                    'border-[var(--color-triage-green)] text-[var(--color-triage-green)] shadow-[var(--color-triage-green)]/20'
                  }
                `}
              >
                <ShieldAlert className="w-16 h-16" />
              </motion.div>
              
              <div className="text-center">
                <p className="text-4xl font-bold font-space text-white">{priority}</p>
                <p className="text-white/50 mt-2">Algorithm detected conditions requiring {priority.toLowerCase()} response.</p>
              </div>

              <div className="flex gap-4 w-full mt-8">
                <button onClick={prevStep} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Edit
                </button>
                <button onClick={nextStep} className="flex-2 w-2/3 py-3 bg-[var(--color-electric-indigo)] hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center justify-center gap-2">
                  Confirm Priority <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-4 font-space">Hematological Requirements</label>
                <BloodToggle selected={bloodType} onChange={setBloodType} />
              </div>
              
              {bloodType && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-black/20 p-4 rounded-lg border border-white/5">
                  <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-3 font-space">Units Required</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="1" max="10" 
                      value={units} 
                      onChange={(e) => setUnits(Number(e.target.value))}
                      className="w-full accent-[var(--color-cyan-glow)]" 
                    />
                    <span className="text-2xl font-bold font-space text-[var(--color-cyan-glow)] w-12 text-center">{units}</span>
                  </div>
                </motion.div>
              )}

              <div className="flex gap-4 w-full pt-4">
                <button onClick={prevStep} className="py-3 px-6 bg-white/5 hover:bg-white/10 text-white rounded-lg">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button onClick={loadFacilities} className="flex-1 py-3 bg-[var(--color-electric-indigo)] hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center justify-center gap-2">
                  Find Hospitals <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-8 w-full"
            >
              <h3 className="text-xl font-space font-bold text-white mb-2 self-start">Select Target Facility</h3>
              <p className="text-white/60 text-sm mb-6 self-start">Cross-referencing ABDM Registry with e-RaktKosh live inventory for {units} units of {bloodType || 'any'} blood.</p>
              
              <div className="w-full">
                <FacilityMap facilities={facilities} onSelectFacility={submitReferral} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
