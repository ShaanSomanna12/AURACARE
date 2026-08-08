'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldAlert, Building2, Droplets, HeartPulse, Send, AlertTriangle, CheckCircle2, MapPin, Search, Phone, Navigation, Clock, Check } from 'lucide-react';
import { useHealthcare } from '@/context/HealthcareContext';

import { createClient } from '@/lib/supabase/client';
import type { BloodType } from '@/lib/types/database.types';

const SYMPTOM_OPTIONS = [
  'Chest Pain',
  'Severe Bleeding',
  'Difficulty Breathing',
  'High Fever',
  'Abdominal Pain',
  'Dizziness',
  'Vomiting',
  'Cough',
];

export default function PatientDashboard() {
  const { facilities, bloodInventory, holdBloodRequest, holdSuccessMsg, registerPatient } = useHealthcare();

  // Enforce Strict RBAC
  useEffect(() => {
    async function enforceRBAC() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const matchCookie = document.cookie.match(/tvarit_role=([^;]+)/);
      const cookieRole = matchCookie ? matchCookie[1] : null;

      if (!user && !cookieRole) {
        window.location.href = '/login';
        return;
      }

      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        const activeRole = profile?.role || cookieRole;
        if (activeRole && activeRole !== 'PATIENT' && cookieRole !== 'PATIENT') {
          if (activeRole === 'CUSTOMER_PHC') window.location.href = '/phc';
          else if (activeRole === 'DOCTOR_ADMIN') window.location.href = '/hospital';
          else if (activeRole === 'RECEPTIONIST') window.location.href = '/receptionist';
        }
      }
    }
    enforceRBAC();
  }, []);

  // Symptom Form State
  const [patientName, setPatientName] = useState('Ananya Rao');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [age, setAge] = useState<number | ''>(32);
  const [gender, setGender] = useState('Female');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [durationDays, setDurationDays] = useState(1);
  const [severity1to10, setSeverity1to10] = useState(5);

  // Search Filter State
  const [searchQuery, setSearchQuery] = useState('');

  // Triage Result State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [triageResult, setTriageResult] = useState<{
    riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    alertTitle: string;
    message: string;
    priorityColor: string;
  } | null>(null);

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  const handleSymptomTriage = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSymptoms.length === 0) return;

    setIsAnalyzing(true);
    setTriageResult(null);

    setTimeout(() => {
      const hasHighRisk = selectedSymptoms.some(s =>
        ['Chest Pain', 'Severe Bleeding', 'Difficulty Breathing'].includes(s)
      );

      const hasMediumRisk = selectedSymptoms.some(s =>
        ['High Fever', 'Abdominal Pain'].includes(s)
      ) || durationDays > 3 || severity1to10 >= 7;

      if (hasHighRisk) {
        setTriageResult({
          riskLevel: 'HIGH',
          alertTitle: 'REQUIRES IMMEDIATE EMERGENCY CARE',
          message: 'Head to the nearest Tertiary Hospital immediately. Emergency medical response team notified.',
          priorityColor: 'bg-red-600 text-white border-red-700',
        });
      } else if (hasMediumRisk) {
        setTriageResult({
          riskLevel: 'MEDIUM',
          alertTitle: 'VISIT NEAREST PHC WITHIN 24 HOURS',
          message: 'Your symptoms warrant medical evaluation by a Primary Health Centre clinician.',
          priorityColor: 'bg-amber-500 text-white border-amber-600',
        });
      } else {
        setTriageResult({
          riskLevel: 'LOW',
          alertTitle: 'SAFE FOR HOME REST & HYDRATION',
          message: 'Your symptoms appear mild and stable. Rest at home and monitor your temperature.',
          priorityColor: 'bg-emerald-600 text-white border-emerald-700',
        });
      }

      // Persist authenticated patient triage record to Supabase patients table & Doctor Queue
      registerPatient({
        full_name: patientName || 'Ananya Rao',
        age: Number(age) || 32,
        gender: gender || 'Female',
        phone: phone || '+91 98765 43210',
        symptoms: selectedSymptoms,
        duration_days: durationDays,
        severity_1to10: severity1to10,
        bp: '120/80',
        pulse: 84,
        temp_f: 98.6,
        spo2: hasHighRisk ? 88 : 97,
        triage_level: hasHighRisk ? 'RED' : hasMediumRisk ? 'YELLOW' : 'GREEN',
        triage_reason: hasHighRisk ? 'CRITICAL: High Risk emergency symptoms self-reported by Patient.' : 'Patient Self Assessment Triage',
      });

      setIsAnalyzing(false);
    }, 600);
  };


  // Filter facilities by town search
  const filteredFacilities = facilities.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.town.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-sky-100 shadow-[0_10px_30px_-10px_rgba(2,132,199,0.08)]">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#050811] border-2 border-pink-500/40 shadow-[0_0_15px_rgba(236,72,153,0.35)] flex items-center justify-center">
            <Image src="/logo.png" alt="Tvarit Logo" width={64} height={64} className="object-cover scale-135" />
          </div>

          <div>
            <h1 className="text-2xl font-space font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <span>Patient Emergency Portal</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-100 text-[#0284C7] font-mono font-bold uppercase">Mandya Network</span>
            </h1>
            <p className="text-slate-500 font-medium text-xs">AI Symptom Triage, Mandya Hospital Bed Locator & e-RaktKosh Blood Reserves</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Ecosystem Sync
          </span>
        </div>
      </div>

      {holdSuccessMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2 shadow-sm"
        >
          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{holdSuccessMsg}</span>
        </motion.div>
      )}

      {/* Grid: Symptom Triage Checker & Hospital Bed/Blood Locator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 1. SYMPTOM TRIAGE CHECKER FORM (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_-15px_rgba(2,132,199,0.1)] border border-sky-100 flex flex-col justify-between space-y-6">
          <form onSubmit={handleSymptomTriage} className="space-y-5">
            <div className="flex items-center gap-2 text-[#0284C7] font-space font-extrabold text-lg">
              <Activity className="w-5 h-5" />
              <span>AI Symptom Triage Checker</span>
            </div>

            {/* Demographics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-space">Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  placeholder="Patient Name"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-space">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-space">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(parseInt(e.target.value) || '')}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-space">Gender</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-2 py-2 text-xs font-medium text-slate-800 outline-none focus:border-[#0284C7]"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>


            {/* Primary Symptoms Multi-Select Chips */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-space">
                Primary Symptoms (Multi-Select)
              </label>
              <div className="flex flex-wrap gap-2">
                {SYMPTOM_OPTIONS.map(sym => {
                  const isSelected = selectedSymptoms.includes(sym);
                  const isCritical = ['Chest Pain', 'Severe Bleeding', 'Difficulty Breathing'].includes(sym);

                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold font-space transition-all border shadow-sm ${
                        isSelected
                          ? isCritical
                            ? 'bg-red-600 text-white border-red-600 shadow-md scale-105'
                            : 'bg-[#0284C7] text-white border-[#0284C7] shadow-md scale-105'
                          : 'bg-[#F8FAFC] text-slate-700 border-slate-200 hover:border-sky-300'
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration & Severity Slider */}
            <div className="space-y-3 bg-[#F0F9FF] p-4 rounded-2xl border border-sky-100">
              <div className="flex items-center justify-between text-xs font-space font-bold text-slate-700">
                <span>Duration: {durationDays} Day(s)</span>
                <input
                  type="range"
                  min="1"
                  max="14"
                  value={durationDays}
                  onChange={e => setDurationDays(Number(e.target.value))}
                  className="w-28 accent-[#0284C7]"
                />
              </div>

              <div className="flex items-center justify-between text-xs font-space font-bold text-slate-700">
                <span>Pain Severity: <span className="text-[#0284C7] text-sm">{severity1to10}/10</span></span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity1to10}
                  onChange={e => setSeverity1to10(Number(e.target.value))}
                  className="w-28 accent-[#0284C7]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAnalyzing || selectedSymptoms.length === 0}
              className="w-full py-4 bg-[#0284C7] hover:bg-[#0369A1] text-white font-space font-bold tracking-wide rounded-2xl transition-all shadow-[0_8px_20px_rgba(2,132,199,0.25)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <Activity className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Run Smart Decision Engine</span>
                </>
              )}
            </button>
          </form>

          {/* AI Decision Alert Box */}
          <AnimatePresence mode="wait">
            {triageResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-2xl border-2 space-y-3 shadow-md ${
                  triageResult.riskLevel === 'HIGH'
                    ? 'bg-red-50/90 border-red-300 text-red-950'
                    : triageResult.riskLevel === 'MEDIUM'
                      ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                      : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-space font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    {triageResult.riskLevel === 'HIGH' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                    <span>{triageResult.riskLevel} RISK TRIAGE</span>
                  </span>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${triageResult.priorityColor}`}>
                    {triageResult.riskLevel}
                  </span>
                </div>

                <h3 className="text-base font-space font-extrabold tracking-tight">{triageResult.alertTitle}</h3>
                <p className="text-xs font-medium leading-relaxed">{triageResult.message}</p>

                {triageResult.riskLevel === 'HIGH' && (
                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => alert('Emergency Call 108 Dispatched!')}
                      className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-space font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call Ambulance (108)
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. REAL-TIME BED LOCATOR & BLOOD BANK FINDER (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Real-Time Bed Locator Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_-15px_rgba(2,132,199,0.1)] border border-sky-100 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-slate-800 font-space font-extrabold text-lg">
                <Building2 className="w-5 h-5 text-[#0284C7]" />
                <span>Real-Time Hospital Bed Locator</span>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter by town or hospital..."
                  className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#0284C7]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredFacilities.map(fac => (
                <div
                  key={fac.hfr_id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-sky-300 bg-[#F8FAFC] space-y-3 transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-space font-extrabold text-slate-800 text-base">{fac.name}</h3>
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {fac.town} • <span className="font-bold text-[#0284C7]">{fac.distance_km} km away</span>
                      </p>
                    </div>

                    <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold uppercase">
                      Open Admission
                    </span>
                  </div>

                  {/* Bed Breakdown Grid */}
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase font-space">General</span>
                      <span className="text-base font-extrabold font-space text-slate-800">{fac.general_beds_avail}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase font-space">Trauma</span>
                      <span className="text-base font-extrabold font-space text-amber-600">{fac.emergency_beds_avail}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase font-space">ICU Beds</span>
                      <span className="text-base font-extrabold font-space text-[#0284C7]">{fac.icu_beds_avail}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase font-space">Ventilators</span>
                      <span className="text-base font-extrabold font-space text-purple-600">{fac.ventilators_free}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blood Bank Finder Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_-15px_rgba(2,132,199,0.1)] border border-sky-100 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600 font-space font-extrabold text-lg">
                <Droplets className="w-5 h-5 text-red-600" />
                <span>Certified Blood Bank Finder (8 Groups)</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[10px] font-mono font-bold uppercase border border-red-200">
                e-RaktKosh Sync
              </span>
            </div>

            <div className="space-y-4">
              {facilities.map(fac => {
                const inventory = bloodInventory[fac.hfr_id] || {};
                const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

                return (
                  <div key={fac.hfr_id} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-space font-extrabold text-slate-800 text-sm">{fac.name} Blood Reserve</h4>
                        <span className="text-[10px] font-mono text-slate-400">{fac.town}</span>
                      </div>

                      <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Verified Live Inventory
                      </span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {bloodTypes.map(bt => {
                        const count = inventory[bt] ?? 0;
                        return (
                          <div
                            key={bt}
                            className={`p-2 rounded-xl text-center border font-space ${
                              count > 0
                                ? 'bg-sky-50/80 border-sky-200 text-[#0284C7]'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                          >
                            <span className="block text-[11px] font-extrabold">{bt}</span>
                            <span className="block text-xs font-bold mt-0.5">{count} u</span>
                            {count > 0 && (
                              <button
                                type="button"
                                onClick={() => holdBloodRequest(fac.hfr_id, bt)}
                                className="mt-1 text-[9px] font-extrabold bg-[#0284C7] hover:bg-[#0369A1] text-white px-1 py-0.5 rounded w-full transition-colors"
                              >
                                Hold
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
