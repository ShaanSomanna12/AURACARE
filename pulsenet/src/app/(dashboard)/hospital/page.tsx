'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, ShieldAlert, Building2, Send, CheckCircle2, AlertTriangle, FileText, Activity, ArrowRight, UserCheck, Clock, ShieldCheck } from 'lucide-react';
import { useHealthcare, PatientRecord } from '@/context/HealthcareContext';
import { createClient } from '@/lib/supabase/client';

export default function DoctorDashboard() {
  const { patients, facilities, issueDirectReferral } = useHealthcare();

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
        if (activeRole && activeRole !== 'DOCTOR_ADMIN' && cookieRole !== 'DOCTOR_ADMIN') {
          if (activeRole === 'PATIENT') window.location.href = '/patient';
          else if (activeRole === 'CUSTOMER_PHC') window.location.href = '/phc';
          else if (activeRole === 'RECEPTIONIST') window.location.href = '/receptionist';
        }
      }
    }
    enforceRBAC();
  }, []);



  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patients[0]?.id || null);
  const [selectedTargetFacId, setSelectedTargetFacId] = useState<string>('FAC-001');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [activeReferralPass, setActiveReferralPass] = useState<PatientRecord | null>(null);

  // Sort patients by urgency (RED first, then YELLOW, then GREEN)
  const sortedPatients = [...patients].sort((a, b) => {
    const order = { RED: 1, YELLOW: 2, GREEN: 3 };
    return order[a.triage_level] - order[b.triage_level];
  });

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const handleIssueReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const updated = issueDirectReferral(
      selectedPatient.id,
      selectedTargetFacId,
      doctorNotes || 'Emergency referral issued by Rural Doctor for direct ICU/Beds admission.'
    );

    if (updated) {
      setActiveReferralPass(updated);
      setDoctorNotes('');
    }
  };

  return (
    <div className="w-full flex flex-col space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0284C7]/10 border border-sky-200 flex items-center justify-center text-[#0284C7]">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-space font-extrabold text-slate-800 tracking-tight">Rural Doctor Command & Clinical Referral Portal</h1>
            <p className="text-slate-500 font-medium text-xs">Patient Registry Triage Queue & Direct City Hospital Referral System</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold uppercase flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Direct Admission Pass Active
        </span>
      </div>

      {/* Referral Digital Pass Notification Modal/Banner */}
      <AnimatePresence>
        {activeReferralPass && activeReferralPass.referral_pass && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 rounded-3xl bg-[#0284C7] text-white shadow-xl space-y-4 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-sky-200" />
                <span className="font-space font-extrabold text-lg uppercase tracking-wider">
                  DIGITAL EMERGENCY REFERRAL PASS ISSUED
                </span>
              </div>

              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-mono font-bold">
                Pass ID: {activeReferralPass.referral_pass.pass_id}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/10 p-4 rounded-2xl border border-white/20">
              <div>
                <span className="block text-[10px] uppercase font-bold text-sky-100 font-space">Patient Name</span>
                <span className="text-base font-extrabold font-space">{activeReferralPass.full_name} ({activeReferralPass.id})</span>
              </div>

              <div>
                <span className="block text-[10px] uppercase font-bold text-sky-100 font-space">Target Hospital</span>
                <span className="text-base font-extrabold font-space">{activeReferralPass.referral_pass.target_facility_name}</span>
              </div>

              <div>
                <span className="block text-[10px] uppercase font-bold text-sky-100 font-space">Est. Arrival (ETA)</span>
                <span className="text-base font-extrabold font-space">{activeReferralPass.referral_pass.eta_mins} Mins</span>
              </div>

              <div>
                <span className="block text-[10px] uppercase font-bold text-sky-100 font-space">Bed Guarantee Status</span>
                <span className="text-xs font-extrabold bg-emerald-500 text-white px-2 py-0.5 rounded inline-block">
                  Direct Open Entry
                </span>
              </div>
            </div>

            <p className="text-xs text-sky-100 font-medium">
              Note: Notification transmitted in real-time to Hospital Receptionist & Emergency Department at {activeReferralPass.referral_pass.target_facility_name}.
            </p>

            <button
              type="button"
              onClick={() => setActiveReferralPass(null)}
              className="px-4 py-2 bg-white text-[#0284C7] font-space font-bold text-xs rounded-xl shadow-md hover:bg-sky-50 transition-colors"
            >
              Dismiss Pass Banner
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid: Patient Registry Queue & Direct Referral Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 1. PATIENT REGISTRY & CLINICAL QUEUE TABLE (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_-15px_rgba(2,132,199,0.1)] border border-sky-100 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 font-space font-extrabold text-lg">
              <FileText className="w-5 h-5 text-[#0284C7]" />
              <span>Patient Clinical Queue (Sorted by Risk)</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[10px] font-mono font-bold uppercase border border-red-200">
              Red Pinned First
            </span>
          </div>

          {/* Table of Forwarded Patients */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-400 font-space">
                  <th className="py-3 px-2">Urgency</th>
                  <th className="py-3 px-2">Patient Details</th>
                  <th className="py-3 px-2">Vitals</th>
                  <th className="py-3 px-2">Symptoms</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {sortedPatients.map(p => {
                  const isSelected = p.id === selectedPatientId;
                  const isRed = p.triage_level === 'RED';

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPatientId(p.id)}
                      className={`cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-sky-50/80 font-bold' 
                          : isRed 
                            ? 'bg-red-50/40 hover:bg-red-50/80' 
                            : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3.5 px-2">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase text-white ${
                          p.triage_level === 'RED' ? 'bg-red-600 animate-pulse' : p.triage_level === 'YELLOW' ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}>
                          {p.triage_level}
                        </span>
                      </td>

                      <td className="py-3.5 px-2 font-space">
                        <span className="font-extrabold block text-slate-800 text-sm">{p.full_name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{p.id} • {p.age} yrs • {p.gender}</span>
                      </td>

                      <td className="py-3.5 px-2 font-mono text-[11px]">
                        <span className={`block font-bold ${p.spo2 < 90 ? 'text-red-600 font-extrabold' : ''}`}>SpO2: {p.spo2}%</span>
                        <span className="block text-slate-500">BP: {p.bp}</span>
                      </td>

                      <td className="py-3.5 px-2">
                        <span className="truncate max-w-[140px] block font-sans text-slate-600">{p.symptoms.join(', ')}</span>
                      </td>

                      <td className="py-3.5 px-2 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedPatientId(p.id)}
                          className={`px-3 py-1.5 rounded-xl font-space font-extrabold text-[11px] transition-all ${
                            isSelected ? 'bg-[#0284C7] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-sky-50'
                          }`}
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. DIRECT EMERGENCY REFERRAL SYSTEM PANEL (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_-15px_rgba(2,132,199,0.1)] border border-sky-100 space-y-6">
          <div className="flex items-center gap-2 text-[#0284C7] font-space font-extrabold text-lg">
            <Send className="w-5 h-5" />
            <span>Direct Emergency Referral System</span>
          </div>

          {selectedPatient ? (
            <form onSubmit={handleIssueReferral} className="space-y-5">
              
              {/* Selected Patient Overview Box */}
              <div className="p-4 rounded-2xl bg-[#F0F9FF] border border-sky-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0284C7] font-space uppercase">Target Patient</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase text-white ${
                    selectedPatient.triage_level === 'RED' ? 'bg-red-600' : 'bg-amber-500'
                  }`}>
                    {selectedPatient.triage_level} Urgency
                  </span>
                </div>

                <h3 className="text-lg font-space font-extrabold text-slate-800">{selectedPatient.full_name} ({selectedPatient.id})</h3>
                <p className="text-xs text-slate-600 font-medium">
                  Diagnosis/Symptoms: <span className="font-bold text-slate-800">{selectedPatient.symptoms.join(', ')}</span>
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  Vitals: SpO2 {selectedPatient.spo2}%, BP {selectedPatient.bp}, Pulse {selectedPatient.pulse} bpm, Temp {selectedPatient.temp_f}°F
                </p>
              </div>

              {/* Tertiary Hospital Selection Grid */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider font-space">
                  Select Tertiary Destination Hospital (Live ICU/Specialists)
                </label>

                <div className="space-y-3">
                  {facilities.map(fac => {
                    const isSelected = fac.hfr_id === selectedTargetFacId;
                    return (
                      <div
                        key={fac.hfr_id}
                        onClick={() => setSelectedTargetFacId(fac.hfr_id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#F0F9FF] border-[#0284C7] shadow-sm'
                            : 'bg-[#F8FAFC] border-slate-200 hover:border-sky-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-space font-extrabold text-sm text-slate-800">{fac.name}</span>
                          <span className="text-xs font-bold text-[#0284C7] font-space">{fac.distance_km} km</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-purple-700">{fac.icu_beds_avail} ICU Beds • {fac.ventilators_free} Vents</span>
                          <span className="text-[10px] text-slate-500 font-medium">Specialists: {fac.specialists.slice(0, 2).join(', ')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Doctor Clinical Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-space">
                  Clinical Referral Instructions / Notes
                </label>
                <textarea
                  value={doctorNotes}
                  onChange={e => setDoctorNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl p-3 text-xs font-medium text-slate-800 outline-none focus:border-[#0284C7]"
                  placeholder="e.g. Patient requires immediate resuscitation & trauma surgery on arrival..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-space font-bold tracking-wide rounded-2xl transition-all shadow-[0_8px_20px_rgba(220,38,38,0.25)] flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Issue Guaranteed Direct Referral Pass</span>
              </button>
            </form>
          ) : (
            <p className="text-slate-400 text-sm">Select a patient from the queue to issue direct referral.</p>
          )}

        </div>

      </div>
    </div>
  );
}
