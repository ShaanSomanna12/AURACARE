'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft, ShieldAlert, Activity, CheckCircle2, User, Stethoscope, AlertTriangle, Building2, Droplets } from 'lucide-react';
import type { BloodType, TriageLevel, Facility } from '@/lib/types/database.types';
import BloodToggle from './BloodToggle';
import { createClient } from '@/lib/supabase/client';
import dynamic from 'next/dynamic';

const FacilityMap = dynamic(() => import('../map/FacilityMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[380px] bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400 font-space text-sm">
      <div className="w-10 h-10 border-4 border-[#0284C7] border-t-transparent rounded-full animate-spin mb-3" />
      Loading Tactical Hospital Registry...
    </div>
  ),
});

const CRITICAL_SYMPTOMS = [
  { label: 'Heavy Bleeding', keyword: 'bleeding', icon: '🩸' },
  { label: 'Cardiac Distress', keyword: 'heart', icon: '💔' },
  { label: 'Unconscious / Coma', keyword: 'unconscious', icon: '🧠' },
  { label: 'Severe Head Trauma', keyword: 'trauma', icon: '🤕' },
];

const URGENT_SYMPTOMS = [
  { label: 'Compound Fracture', keyword: 'fracture', icon: '🦴' },
  { label: 'MVA Trauma', keyword: 'trauma', icon: '💥' },
  { label: 'Deep Laceration', keyword: 'bleeding', icon: '🩹' },
  { label: 'Acute Abdominal Pain', keyword: 'pain', icon: '⚡' },
];

const VITAL_SYMPTOMS = [
  { label: 'Low Blood Pressure', keyword: 'bleeding', icon: '📉' },
  { label: 'Blood Loss > 2 Units', keyword: 'bleeding', icon: '🩸' },
  { label: 'Sepsis Suspected', keyword: 'fever', icon: '🤒' },
  { label: 'Spinal Injury', keyword: 'trauma', icon: '⚠️' },
];

export default function TriageWizard() {
  const [step, setStep] = useState(1);
  const [patientName, setPatientName] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [customNotes, setCustomNotes] = useState('');
  const [priority, setPriority] = useState<TriageLevel>('GREEN');
  const [bloodType, setBloodType] = useState<BloodType | null>(null);
  const [units, setUnits] = useState(1);
  const [facilities, setFacilities] = useState<Facility[]>([]);

  const toggleChip = (chipLabel: string) => {
    setSelectedChips(prev => 
      prev.includes(chipLabel) ? prev.filter(c => c !== chipLabel) : [...prev, chipLabel]
    );
  };

  const getCombinedSymptoms = () => {
    const chipText = selectedChips.join(', ');
    if (chipText && customNotes) return `${chipText}. Notes: ${customNotes}`;
    return chipText || customNotes;
  };

  const symptoms = getCombinedSymptoms();

  const loadFacilities = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('facilities').select('*');
    if (data) setFacilities(data);
    nextStep();
  };

  const submitReferral = useCallback(async (facilityId: string) => {
    const supabase = createClient();
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
    alert('Referral Transmitted Successfully to Hospital Command Center!');
    setStep(1);
    setPatientName('');
    setSelectedChips([]);
    setCustomNotes('');
  }, [patientName, priority, symptoms, bloodType, units]);

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // Auto-calculate priority based on symptoms
  const calculatePriority = () => {
    const text = symptoms.toLowerCase();
    if (text.includes('bleeding') || text.includes('unconscious') || text.includes('heart') || text.includes('head') || text.includes('coma') || text.includes('loss')) {
      setPriority('RED');
    } else if (text.includes('fracture') || text.includes('pain') || text.includes('mva') || text.includes('laceration')) {
      setPriority('YELLOW');
    } else {
      setPriority('GREEN');
    }
    nextStep();
  };


  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(2,132,199,0.15)] border border-[#E0F2FE] overflow-hidden relative">
      
      {/* Top Clinical Accent Bar */}
      <div className="h-2 bg-gradient-to-r from-[#0EA5E9] via-[#0284C7] to-[#0EA5E9]" />

      {/* Header */}
      <div className="bg-[#FAFAFA] p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F0F9FF] border border-sky-200 flex items-center justify-center text-[#0284C7]">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-space font-extrabold text-slate-800 tracking-tight">
              Clinical Assessment Protocol
            </h2>
            <p className="text-xs font-semibold text-slate-400">Step {step} of 4</p>
          </div>
        </div>

        {/* Step Indicator Pills */}
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s} 
              className={`h-2.5 w-8 rounded-full transition-all duration-300 ${
                s === step 
                  ? 'bg-[#0284C7] shadow-[0_2px_8px_rgba(2,132,199,0.4)]' 
                  : s < step 
                    ? 'bg-sky-200' 
                    : 'bg-slate-100'
              }`} 
            />
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="p-6 sm:p-8 min-h-[420px] relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2 font-space flex items-center gap-2">
                  <User className="w-4 h-4 text-[#0284C7]" />
                  Patient Identifier / Name
                </label>
                <input 
                  type="text" 
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-[#0284C7] focus:bg-white focus:ring-4 focus:ring-[#0284C7]/10 rounded-2xl px-4 py-4 text-slate-800 placeholder-slate-400 outline-none transition-all font-sans font-medium"
                  placeholder="e.g. John Doe / Patient ID-4592"
                />
              </div>

              {/* Row-wise Categorized Symptoms Selector */}
              <div className="space-y-4">
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1 font-space flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#0284C7]" />
                    Select Symptoms (Categorized by Severity)
                  </span>
                  {selectedChips.length > 0 && (
                    <span className="text-[11px] font-bold text-[#0284C7] bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                      {selectedChips.length} selected
                    </span>
                  )}
                </label>

                {/* ROW 1: CRITICAL EMERGENCY (RED/ROSE) */}
                <div className="bg-red-50/50 p-3.5 rounded-2xl border border-red-100">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-red-600 mb-2 font-space flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Row 1: Critical Life-Threatening Emergencies
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {CRITICAL_SYMPTOMS.map((symptom) => {
                      const isSelected = selectedChips.includes(symptom.label);
                      return (
                        <button
                          key={symptom.label}
                          type="button"
                          onClick={() => toggleChip(symptom.label)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold font-space transition-all flex items-center gap-1.5 border shadow-sm ${
                            isSelected
                              ? 'bg-red-600 text-white border-red-600 shadow-[0_4px_12px_rgba(220,38,38,0.25)] scale-105'
                              : 'bg-white text-slate-700 border-red-200 hover:border-red-400 hover:bg-red-50'
                          }`}
                        >
                          <span>{symptom.icon}</span>
                          <span>{symptom.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ROW 2: URGENT TRAUMA (AMBER/WARM) */}
                <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-amber-700 mb-2 font-space flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Row 2: Urgent Trauma & Fractures
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {URGENT_SYMPTOMS.map((symptom) => {
                      const isSelected = selectedChips.includes(symptom.label);
                      return (
                        <button
                          key={symptom.label}
                          type="button"
                          onClick={() => toggleChip(symptom.label)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold font-space transition-all flex items-center gap-1.5 border shadow-sm ${
                            isSelected
                              ? 'bg-amber-500 text-white border-amber-500 shadow-[0_4px_12px_rgba(245,158,11,0.25)] scale-105'
                              : 'bg-white text-slate-700 border-amber-200 hover:border-amber-400 hover:bg-amber-50'
                          }`}
                        >
                          <span>{symptom.icon}</span>
                          <span>{symptom.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ROW 3: VITAL SIGNS & STATUS FLAGS (SKY/BLUE) */}
                <div className="bg-sky-50/50 p-3.5 rounded-2xl border border-sky-100">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#0284C7] mb-2 font-space flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                    Row 3: Hemodynamic & Vital Signs Flags
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {VITAL_SYMPTOMS.map((symptom) => {
                      const isSelected = selectedChips.includes(symptom.label);
                      return (
                        <button
                          key={symptom.label}
                          type="button"
                          onClick={() => toggleChip(symptom.label)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold font-space transition-all flex items-center gap-1.5 border shadow-sm ${
                            isSelected
                              ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-[0_4px_12px_rgba(2,132,199,0.25)] scale-105'
                              : 'bg-white text-slate-700 border-sky-200 hover:border-[#0284C7] hover:bg-sky-50'
                          }`}
                        >
                          <span>{symptom.icon}</span>
                          <span>{symptom.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Custom Clinical Notes Field */}
              <div>
                <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 font-space">
                  Additional Clinical Notes / Vital Measurements (Optional)
                </label>
                <textarea 
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-[#0284C7] focus:bg-white focus:ring-4 focus:ring-[#0284C7]/10 rounded-2xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none transition-all font-sans text-sm font-medium"
                  placeholder="e.g. BP 80/50, pulse 130 bpm, IV line started..."
                />
              </div>

              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={calculatePriority}
                disabled={!symptoms}
                className="w-full py-4 bg-[#0284C7] hover:bg-[#0369A1] text-white font-space font-bold tracking-wide rounded-2xl transition-all shadow-[0_8px_20px_rgba(2,132,199,0.25)] hover:shadow-[0_8px_25px_rgba(2,132,199,0.35)] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                <span>Analyze & Calculate Priority</span>
                <ChevronRight className="w-5 h-5" />
              </motion.button>

            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center space-y-6 py-6"
            >
              <span className="text-xs font-extrabold text-slate-400 font-space tracking-widest uppercase bg-slate-100 px-3 py-1 rounded-full">
                Calculated Triage Severity
              </span>
              
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }} 
                transition={{ repeat: Infinity, duration: priority === 'RED' ? 1.2 : 3, ease: "easeInOut" }}
                className={`w-36 h-36 rounded-full flex items-center justify-center border-4 transition-all duration-300
                  ${priority === 'RED' 
                    ? 'border-red-500 text-red-600 bg-red-50/80 shadow-[0_0_35px_rgba(239,68,68,0.25)]' 
                    : priority === 'YELLOW' 
                      ? 'border-amber-500 text-amber-600 bg-amber-50/80 shadow-[0_0_35px_rgba(245,158,11,0.25)]' 
                      : 'border-emerald-500 text-emerald-600 bg-emerald-50/80 shadow-[0_0_35px_rgba(16,185,129,0.25)]'
                  }
                `}
              >
                <ShieldAlert className="w-20 h-20" />
              </motion.div>
              
              <div className="text-center max-w-sm">
                <h3 className={`text-4xl font-extrabold font-space tracking-tight
                  ${priority === 'RED' ? 'text-red-600' : priority === 'YELLOW' ? 'text-amber-600' : 'text-emerald-600'}
                `}>
                  TRIAGE {priority}
                </h3>
                <p className="text-slate-500 font-medium text-sm mt-2">
                  {priority === 'RED' 
                    ? 'Critical condition requiring immediate resuscitation & trauma unit transfer.'
                    : priority === 'YELLOW'
                      ? 'Urgent condition requiring fast specialized medical response.'
                      : 'Stable condition suitable for standard outpatient care.'}
                </p>
              </div>

              <div className="flex gap-4 w-full pt-4">
                <button 
                  onClick={prevStep} 
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 font-space"
                >
                  <ArrowLeft className="w-4 h-4" /> Edit Symptoms
                </button>
                <button 
                  onClick={nextStep} 
                  className="flex-2 w-2/3 py-4 bg-[#0284C7] hover:bg-[#0369A1] text-white font-space font-bold rounded-2xl transition-all shadow-[0_8px_20px_rgba(2,132,199,0.25)] flex items-center justify-center gap-2"
                >
                  <span>Confirm Priority</span>
                  <ChevronRight className="w-5 h-5" />
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
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3 font-space flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-red-500" />
                  Hematological & Blood Product Requirements
                </label>
                <BloodToggle selected={bloodType} onChange={setBloodType} />
              </div>
              
              {bloodType && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#F0F9FF] p-5 rounded-2xl border border-sky-100">
                  <label className="block text-xs font-bold text-[#0284C7] uppercase tracking-wider mb-3 font-space">
                    Required Units of {bloodType}
                  </label>
                  <div className="flex items-center gap-5">
                    <input 
                      type="range" 
                      min="1" max="10" 
                      value={units} 
                      onChange={(e) => setUnits(Number(e.target.value))}
                      className="w-full accent-[#0284C7] cursor-pointer h-2 bg-sky-200 rounded-lg" 
                    />
                    <span className="text-3xl font-extrabold font-space text-[#0284C7] w-12 text-center bg-white py-1 px-3 rounded-xl border border-sky-200 shadow-sm">
                      {units}
                    </span>
                  </div>
                </motion.div>
              )}

              <div className="flex gap-4 w-full pt-4">
                <button 
                  onClick={prevStep} 
                  className="py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={loadFacilities} 
                  className="flex-1 py-4 bg-[#0284C7] hover:bg-[#0369A1] text-white font-space font-bold rounded-2xl transition-all shadow-[0_8px_20px_rgba(2,132,199,0.25)] flex items-center justify-center gap-2"
                >
                  <span>Search Hospitals</span>
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-4 w-full space-y-4"
            >
              <div className="self-start">
                <h3 className="text-xl font-space font-extrabold text-slate-800">Select Target Destination Facility</h3>
                <p className="text-slate-500 text-xs font-medium mt-1">
                  Cross-referencing ABDM Registry with e-RaktKosh live inventory for {units} units of {bloodType || 'any'} blood.
                </p>
              </div>
              
              <div className="w-full">
                <FacilityMap facilities={facilities} onSelectFacility={submitReferral} />
              </div>

              <button 
                onClick={prevStep} 
                className="self-start text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 font-space"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Blood Selection
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

