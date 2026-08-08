'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Droplets, Plus, Minus, Save, CheckCircle2, RefreshCw, Activity, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { useHealthcare } from '@/context/HealthcareContext';
import { createClient } from '@/lib/supabase/client';
import type { BloodType } from '@/lib/types/database.types';

const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function ReceptionistDashboard() {
  const { facilities, bloodInventory, updateBedCapacity, updateBloodUnit, incomingReferrals } = useHealthcare();

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
        if (activeRole && activeRole !== 'RECEPTIONIST' && cookieRole !== 'RECEPTIONIST') {
          if (activeRole === 'PATIENT') window.location.href = '/patient';
          else if (activeRole === 'CUSTOMER_PHC') window.location.href = '/phc';
          else if (activeRole === 'DOCTOR_ADMIN') window.location.href = '/hospital';
        }
      }
    }
    enforceRBAC();
  }, []);



  const [selectedFacilityId, setSelectedFacilityId] = useState('FAC-001');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const selectedFacility = facilities.find(f => f.hfr_id === selectedFacilityId) || facilities[0];
  const facilityBlood = bloodInventory[selectedFacilityId] || {};

  // Handlers for bed counts
  const handleBedUpdate = async (type: 'general' | 'emergency' | 'icu' | 'ventilators', delta: number) => {
    let newGeneral = selectedFacility.general_beds_avail;
    let newEmergency = selectedFacility.emergency_beds_avail;
    let newIcu = selectedFacility.icu_beds_avail;
    let newVents = selectedFacility.ventilators_free;

    if (type === 'general') newGeneral = Math.max(0, newGeneral + delta);
    if (type === 'emergency') newEmergency = Math.max(0, newEmergency + delta);
    if (type === 'icu') newIcu = Math.max(0, newIcu + delta);
    if (type === 'ventilators') newVents = Math.max(0, newVents + delta);

    await updateBedCapacity(selectedFacilityId, {
      general: newGeneral,
      emergency: newEmergency,
      icu: newIcu,
      ventilators: newVents,
    });

    setSaveSuccessMsg(`Updated ${type} capacity! Synced live across Patient, PHC, and Doctor dashboards.`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleBloodUpdate = async (bt: BloodType, delta: number) => {
    const current = facilityBlood[bt] || 0;
    const newCount = Math.max(0, current + delta);
    await updateBloodUnit(selectedFacilityId, bt, newCount);

    setSaveSuccessMsg(`Updated ${bt} blood inventory to ${newCount} units!`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  return (
    <div className="w-full flex flex-col space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0284C7] to-[#0EA5E9] flex items-center justify-center text-white shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-space font-extrabold text-slate-800 tracking-tight">Hospital Receptionist Portal</h1>
            <p className="text-slate-500 font-medium text-xs">Live Bed Capacity, 8-Group Blood Inventory & Incoming Referral Monitor</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedFacilityId}
            onChange={e => setSelectedFacilityId(e.target.value)}
            className="bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-bold text-xs font-space outline-none focus:border-[#0284C7]"
          >
            {facilities.map(f => (
              <option key={f.hfr_id} value={f.hfr_id}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      {saveSuccessMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2 shadow-sm"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{saveSuccessMsg}</span>
        </motion.div>
      )}

      {/* 3. INCOMING EMERGENCY REFERRAL MONITOR BANNER */}
      {incomingReferrals.length > 0 && (
        <div className="bg-red-600 text-white p-6 rounded-3xl shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-yellow-300 animate-bounce" />
              <span className="font-space font-extrabold text-base tracking-wider uppercase">
                INCOMING EMERGENCY REFERRAL PASS ALERT ({incomingReferrals.length})
              </span>
            </div>

            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-mono font-bold">
              Guaranteed Admission
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {incomingReferrals.map(ref => (
              <div key={ref.id} className="bg-white/15 p-4 rounded-2xl border border-white/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-space font-extrabold text-sm">{ref.full_name} ({ref.id})</span>
                  <span className="text-[10px] font-mono bg-yellow-400 text-slate-900 px-2 py-0.5 rounded font-extrabold">
                    {ref.triage_level}
                  </span>
                </div>

                <p className="text-xs text-sky-100 font-medium">
                  Vitals: SpO2 {ref.spo2}%, BP {ref.bp}, Temp {ref.temp_f}°F
                </p>

                {ref.referral_pass && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10 font-mono">
                    <span className="flex items-center gap-1 font-bold">
                      <Clock className="w-3.5 h-3.5" /> ETA: {ref.referral_pass.eta_mins} mins
                    </span>
                    <span className="text-sky-200">Pass: {ref.referral_pass.pass_id}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: 1. Live Bed Capacity Management & 2. Blood Inventory (8 Groups) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 1. LIVE BED CAPACITY MANAGEMENT (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_-15px_rgba(2,132,199,0.1)] border border-sky-100 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#0284C7] font-space font-extrabold text-lg">
              <Building2 className="w-5 h-5" />
              <span>Live Bed Capacity Management</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold uppercase border border-emerald-200">
              Live Sync
            </span>
          </div>

          <p className="text-slate-500 text-xs font-medium">
            Counter interface to update capacity. Adjustments immediately sync across Patient, PHC Worker, and Doctor portals.
          </p>

          <div className="space-y-4">
            {/* General Wards */}
            <div className="p-4 rounded-2xl bg-[#F0F9FF] border border-sky-100 flex items-center justify-between">
              <div>
                <span className="block font-space font-extrabold text-slate-800 text-sm">General Wards</span>
                <span className="text-[10px] text-slate-400 font-semibold font-mono">
                  {selectedFacility.general_beds_avail} Avail / {selectedFacility.general_beds_total} Total
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBedUpdate('general', -1)}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center shadow-sm"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="w-10 text-center font-space font-extrabold text-lg text-[#0284C7]">
                  {selectedFacility.general_beds_avail}
                </span>

                <button
                  type="button"
                  onClick={() => handleBedUpdate('general', 1)}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Emergency / Trauma Beds */}
            <div className="p-4 rounded-2xl bg-[#F0F9FF] border border-sky-100 flex items-center justify-between">
              <div>
                <span className="block font-space font-extrabold text-slate-800 text-sm">Emergency / Trauma Beds</span>
                <span className="text-[10px] text-amber-600 font-bold font-mono">Available Trauma Units</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBedUpdate('emergency', -1)}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center shadow-sm"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="w-10 text-center font-space font-extrabold text-lg text-amber-600">
                  {selectedFacility.emergency_beds_avail}
                </span>

                <button
                  type="button"
                  onClick={() => handleBedUpdate('emergency', 1)}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ICU Beds */}
            <div className="p-4 rounded-2xl bg-[#F0F9FF] border border-sky-100 flex items-center justify-between">
              <div>
                <span className="block font-space font-extrabold text-slate-800 text-sm">ICU Beds</span>
                <span className="text-[10px] text-[#0284C7] font-bold font-mono">Critical ICU Capacity</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBedUpdate('icu', -1)}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center shadow-sm"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="w-10 text-center font-space font-extrabold text-lg text-[#0284C7]">
                  {selectedFacility.icu_beds_avail}
                </span>

                <button
                  type="button"
                  onClick={() => handleBedUpdate('icu', 1)}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Ventilators */}
            <div className="p-4 rounded-2xl bg-[#F0F9FF] border border-sky-100 flex items-center justify-between">
              <div>
                <span className="block font-space font-extrabold text-slate-800 text-sm">Ventilators (Free)</span>
                <span className="text-[10px] text-purple-600 font-bold font-mono">Assisted Ventilation Units</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBedUpdate('ventilators', -1)}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center shadow-sm"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="w-10 text-center font-space font-extrabold text-lg text-purple-600">
                  {selectedFacility.ventilators_free}
                </span>

                <button
                  type="button"
                  onClick={() => handleBedUpdate('ventilators', 1)}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. BLOOD BANK INVENTORY MANAGEMENT (8 GROUPS) (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_-15px_rgba(2,132,199,0.1)] border border-sky-100 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-600 font-space font-extrabold text-lg">
              <Droplets className="w-5 h-5 text-red-600" />
              <span>Blood Bank Inventory Management (8 Groups)</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[10px] font-mono font-bold uppercase border border-red-200">
              e-RaktKosh Live
            </span>
          </div>

          <p className="text-slate-500 text-xs font-medium">
            Fast [+] and [-] counter buttons to update available units across all 8 standard blood groups.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {BLOOD_TYPES.map(bt => {
              const count = facilityBlood[bt] ?? 0;
              const isLow = count <= 3;

              return (
                <div
                  key={bt}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center space-y-2 relative overflow-hidden shadow-sm ${
                    isLow ? 'bg-red-50/70 border-red-200' : 'bg-[#F8FAFC] border-slate-200 hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-space font-extrabold text-lg text-slate-800">{bt}</span>
                    {isLow && (
                      <span className="text-[9px] font-extrabold uppercase bg-red-600 text-white px-1.5 py-0.5 rounded">
                        LOW
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 w-full justify-center">
                    <button
                      type="button"
                      onClick={() => handleBloodUpdate(bt, -1)}
                      className="w-8 h-8 rounded-xl bg-white text-slate-700 border border-slate-200 hover:border-[#0284C7] flex items-center justify-center font-bold text-sm shadow-sm"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-xl font-space font-extrabold text-slate-800 w-8 text-center">
                      {count}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleBloodUpdate(bt, 1)}
                      className="w-8 h-8 rounded-xl bg-white text-slate-700 border border-slate-200 hover:border-[#0284C7] flex items-center justify-center font-bold text-sm shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-[10px] text-slate-400 font-semibold font-space">
                    {count} Units Available
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
