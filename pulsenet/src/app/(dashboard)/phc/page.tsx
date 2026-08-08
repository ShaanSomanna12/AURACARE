'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Activity, ShieldAlert, Building2, CheckCircle2, AlertTriangle, Stethoscope, Droplets, ArrowRight } from 'lucide-react';
import { useHealthcare, PatientRecord } from '@/context/HealthcareContext';
import { createClient } from '@/lib/supabase/client';
import TriageWizard from '@/components/triage/TriageWizard';
import type { TriageLevel } from '@/lib/types/database.types';

export default function PHCPortal() {
  const { facilities, registerPatient, patients } = useHealthcare();

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
        if (activeRole && activeRole !== 'CUSTOMER_PHC' && cookieRole !== 'CUSTOMER_PHC') {
          if (activeRole === 'PATIENT') window.location.href = '/patient';
          else if (activeRole === 'DOCTOR_ADMIN') window.location.href = '/hospital';
          else if (activeRole === 'RECEPTIONIST') window.location.href = '/receptionist';
        }
      }
    }
    enforceRBAC();
  }, []);



  // Intake Form State
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number | ''>(45);
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [symptomsInput, setSymptomsInput] = useState('');
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState<number | ''>(82);
  const [tempF, setTempF] = useState<number | ''>(98.6);
  const [spo2, setSpo2] = useState<number | ''>(97);
  const [lastRegistered, setLastRegistered] = useState<PatientRecord | null>(null);

  // Auto calculate Triage Matrix from Vitals
  const calculateVitalsTriage = (): { level: TriageLevel; reason: string } => {
    const s = Number(spo2) || 97;
    const p = Number(pulse) || 80;
    const t = Number(tempF) || 98.6;
    const sysBp = parseInt(bp.split('/')[0]) || 120;
    const sym = symptomsInput.toLowerCase();

    if (s < 90 || sysBp > 160 || sysBp < 90 || sym.includes('bleeding') || sym.includes('chest pain') || sym.includes('unconscious')) {
      return {
        level: 'RED',
        reason: `CRITICAL: ${s < 90 ? 'SpO2 < 90%' : sysBp > 160 ? 'Hypertensive Crisis BP > 160' : 'High-risk trauma / vital instability'}`,
      };
    } else if (t > 101 || p > 110 || sysBp > 140 || sym.includes('fracture')) {
      return {
        level: 'YELLOW',
        reason: `URGENT: ${t > 101 ? 'High fever > 101°F' : p > 110 ? 'Tachycardia pulse > 110' : 'Elevated risk parameters'}`,
      };
    }

    return {
      level: 'GREEN',
      reason: 'STABLE: Vitals within normal physiological range.',
    };
  };

  const currentTriage = calculateVitalsTriage();

  const handlePatientIntake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) return;

    const triage = calculateVitalsTriage();

    const created = registerPatient({
      full_name: fullName,
      age: Number(age) || 30,
      gender,
      phone: phone || '+91 98000 00000',
      symptoms: symptomsInput ? [symptomsInput] : ['General Malaise'],
      duration_days: 1,
      severity_1to10: triage.level === 'RED' ? 9 : triage.level === 'YELLOW' ? 6 : 3,
      bp: bp || '120/80',
      pulse: Number(pulse) || 80,
      temp_f: Number(tempF) || 98.6,
      spo2: Number(spo2) || 97,
      triage_level: triage.level,
      triage_reason: triage.reason,
    });

    setLastRegistered(created);

    // Reset Form
    setFullName('');
    setSymptomsInput('');
  };

  return (
    <div className="w-full flex flex-col space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0284C7] to-[#0EA5E9] flex items-center justify-center text-white shadow-md">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-space font-extrabold text-slate-800 tracking-tight">Primary Health Centre (PHC) Worker Portal</h1>
            <p className="text-slate-500 font-medium text-xs">Patient Intake, Automated Triage Matrix & Tertiary Bed Finder</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-sky-50 text-[#0284C7] border border-sky-200 text-xs font-mono font-bold uppercase">
          PHC Mobile Unit Active
        </span>
      </div>

      {/* Grid: Patient Registration & Triage Matrix / Bed Finder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* 1. PATIENT INTAKE & VITALS REGISTRATION FORM (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_-15px_rgba(2,132,199,0.1)] border border-sky-100 flex flex-col justify-between space-y-6">
          <form onSubmit={handlePatientIntake} className="space-y-5">
            <div className="flex items-center gap-2 text-[#0284C7] font-space font-extrabold text-lg">
              <UserPlus className="w-5 h-5" />
              <span>Patient Intake & Vitals Registration</span>
            </div>

            {/* Demographics Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-space">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Anitha Sharma"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
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
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-space">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98000..."
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-2 py-2 text-xs font-medium text-slate-800 outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-space">Symptoms / Chief Complaint</label>
                <input
                  type="text"
                  value={symptomsInput}
                  onChange={e => setSymptomsInput(e.target.value)}
                  placeholder="e.g. Chest tightness, acute dyspnea"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-[#0284C7]"
                />
              </div>
            </div>

            {/* Vitals Input Grid */}
            <div className="bg-[#F0F9FF] p-4 rounded-2xl border border-sky-100 space-y-3">
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-[#0284C7] font-space">
                Clinical Vital Signs
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 font-space uppercase">Blood Pressure (mmHg)</label>
                  <input
                    type="text"
                    value={bp}
                    onChange={e => setBp(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 font-space uppercase">Pulse Rate (bpm)</label>
                  <input
                    type="number"
                    value={pulse}
                    onChange={e => setPulse(parseInt(e.target.value) || '')}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 font-space uppercase">Temperature (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempF}
                    onChange={e => setTempF(parseFloat(e.target.value) || '')}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 font-space uppercase">SpO2 Oxygen (%)</label>
                  <input
                    type="number"
                    value={spo2}
                    onChange={e => setSpo2(parseInt(e.target.value) || '')}
                    className={`w-full border rounded-xl px-3 py-1.5 text-xs font-extrabold outline-none ${
                      (Number(spo2) || 97) < 90 ? 'bg-red-50 border-red-300 text-red-600' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Live Triage Matrix Preview */}
            <div className={`p-4 rounded-2xl border-2 flex items-center justify-between shadow-sm ${
              currentTriage.level === 'RED'
                ? 'bg-red-50 border-red-300 text-red-900'
                : currentTriage.level === 'YELLOW'
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}>
              <div>
                <span className="block text-[10px] font-mono font-bold uppercase tracking-wider">Automated Triage Matrix</span>
                <span className="text-sm font-space font-extrabold">{currentTriage.reason}</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-space font-extrabold text-white ${
                currentTriage.level === 'RED' ? 'bg-red-600' : currentTriage.level === 'YELLOW' ? 'bg-amber-500' : 'bg-emerald-600'
              }`}>
                {currentTriage.level}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#0284C7] hover:bg-[#0369A1] text-white font-space font-bold tracking-wide rounded-2xl transition-all shadow-[0_8px_20px_rgba(2,132,199,0.25)] flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Register Patient & Queue for Doctor</span>
            </button>
          </form>

          {lastRegistered && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Registered {lastRegistered.full_name} ({lastRegistered.id}) with Triage Level {lastRegistered.triage_level}. Logged to Doctor Registry!</span>
            </div>
          )}
        </div>

        {/* 2. RESOURCE & TERTIARY BED FINDER (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Triage Protocol Interactive Wizard */}
          <TriageWizard />

          {/* Regional Hospital Bed Capacity Live Lookup */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_-15px_rgba(2,132,199,0.1)] border border-sky-100 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-space font-extrabold text-lg">
                <Building2 className="w-5 h-5 text-[#0284C7]" />
                <span>Regional Hospital Capacity Lookup</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-sky-50 text-[#0284C7] text-[10px] font-mono font-bold uppercase border border-sky-200">
                District & Tertiary
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {facilities.map(fac => (
                <div key={fac.hfr_id} className="p-4 rounded-2xl border border-slate-200 bg-[#F8FAFC] flex items-center justify-between">
                  <div>
                    <h4 className="font-space font-extrabold text-slate-800 text-sm">{fac.name}</h4>
                    <p className="text-xs text-slate-400 font-medium">{fac.town} • {fac.distance_km} km</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-extrabold font-space text-[#0284C7] block">{fac.general_beds_avail} General Beds</span>
                      <span className="text-xs font-bold font-space text-purple-600 block">{fac.icu_beds_avail} ICU • {fac.ventilators_free} Vents</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
