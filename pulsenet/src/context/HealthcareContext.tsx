'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { BloodType, TriageLevel } from '@/lib/types/database.types';
import { createClient } from '@/lib/supabase/client';

export type FacilityDetail = {
  hfr_id: string;
  name: string;
  town: string;
  distance_km: number;
  latitude: number;
  longitude: number;
  general_beds_avail: number;
  general_beds_total: number;
  emergency_beds_avail: number;
  icu_beds_avail: number;
  ventilators_free: number;
  specialists: string[];
};

export type PatientRecord = {
  id: string; // Patient ID like PAT-8492
  full_name: string;
  age: number;
  gender: string;
  phone: string;
  symptoms: string[];
  custom_symptoms?: string;
  duration_days: number;
  severity_1to10: number;
  bp: string;
  pulse: number;
  temp_f: number;
  spo2: number;
  triage_level: TriageLevel;
  triage_reason: string;
  registered_at: string;
  referral_pass?: {
    pass_id: string;
    target_facility_name: string;
    target_facility_id: string;
    eta_mins: number;
    doctor_notes: string;
    issued_at: string;
  };
};

type HealthcareContextType = {
  facilities: FacilityDetail[];
  bloodInventory: Record<string, Record<BloodType, number>>;
  patients: PatientRecord[];
  incomingReferrals: PatientRecord[];
  updateBedCapacity: (facilityId: string, updates: { general?: number; emergency?: number; icu?: number; ventilators?: number }) => Promise<void>;
  updateBloodUnit: (facilityId: string, bloodType: BloodType, count: number) => Promise<void>;
  registerPatient: (patient: Omit<PatientRecord, 'id' | 'registered_at'>) => PatientRecord;
  issueDirectReferral: (patientId: string, facilityId: string, doctorNotes: string) => PatientRecord | null;
  holdBloodRequest: (facilityId: string, bloodType: BloodType) => void;
  holdSuccessMsg: string | null;
};

const INITIAL_FACILITIES: FacilityDetail[] = [
  {
    hfr_id: 'HFR-MDY-1001',
    name: 'Mandya Institute of Medical Sciences (MIMS) Hospital',
    town: 'Nehru Nagar, Mandya',
    distance_km: 1.2,
    latitude: 12.52605,
    longitude: 76.90021,
    general_beds_avail: 48,
    general_beds_total: 550,
    emergency_beds_avail: 16,
    icu_beds_avail: 22,
    ventilators_free: 8,
    specialists: ['Trauma Surgery', 'Cardiology', 'General Medicine', 'Pediatrics', 'Orthopedics'],
  },
  {
    hfr_id: 'HFR-MDY-1002',
    name: 'District Government Hospital, Mandya',
    town: 'Subhash Nagar, Mandya',
    distance_km: 2.5,
    latitude: 12.5305,
    longitude: 76.8950,
    general_beds_avail: 36,
    general_beds_total: 300,
    emergency_beds_avail: 10,
    icu_beds_avail: 12,
    ventilators_free: 4,
    specialists: ['General Practice', 'Pulmonology', 'Pediatrics', 'Obstetrics'],
  },
  {
    hfr_id: 'HFR-MDY-1003',
    name: 'Sanjo Multispeciality Hospital',
    town: 'Visvesvaraya Nagar, Mandya',
    distance_km: 3.1,
    latitude: 12.5218,
    longitude: 76.8965,
    general_beds_avail: 24,
    general_beds_total: 180,
    emergency_beds_avail: 6,
    icu_beds_avail: 8,
    ventilators_free: 3,
    specialists: ['Obstetrics', 'General Surgery', 'Emergency Care', 'Neurology'],
  },
  {
    hfr_id: 'HFR-MDY-1004',
    name: 'Sanjay Memorial Hospital, Mandya',
    town: 'Bengaluru-Mysuru Main Road, Mandya',
    distance_km: 4.8,
    latitude: 12.5180,
    longitude: 76.9040,
    general_beds_avail: 15,
    general_beds_total: 120,
    emergency_beds_avail: 4,
    icu_beds_avail: 5,
    ventilators_free: 2,
    specialists: ['Orthopedics', 'Nephrology', 'Internal Medicine'],
  },
];

const INITIAL_BLOOD: Record<string, Record<BloodType, number>> = {
  'HFR-MDY-1001': { 'A+': 32, 'A-': 5, 'B+': 24, 'B-': 7, 'AB+': 11, 'AB-': 3, 'O+': 40, 'O-': 9 },
  'HFR-MDY-1002': { 'A+': 18, 'A-': 2, 'B+': 14, 'B-': 3, 'AB+': 5, 'AB-': 1, 'O+': 22, 'O-': 4 },
  'HFR-MDY-1003': { 'A+': 10, 'A-': 1, 'B+': 8, 'B-': 2, 'AB+': 3, 'AB-': 0, 'O+': 14, 'O-': 2 },
  'HFR-MDY-1004': { 'A+': 6, 'A-': 0, 'B+': 5, 'B-': 1, 'AB+': 2, 'AB-': 0, 'O+': 8, 'O-': 1 },
};


const INITIAL_PATIENTS: PatientRecord[] = [
  {
    id: 'PAT-8491',
    full_name: 'Rajesh Kumar',
    age: 52,
    gender: 'Male',
    phone: '+91 98765 43210',
    symptoms: ['Chest Pain', 'Difficulty Breathing'],
    duration_days: 1,
    severity_1to10: 9,
    bp: '160/100',
    pulse: 118,
    temp_f: 98.6,
    spo2: 88,
    triage_level: 'RED',
    triage_reason: 'CRITICAL: SpO2 88% (<90%) & Chest Pain detected. High Risk for Acute Myocardial Infarction.',
    registered_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'PAT-8492',
    full_name: 'Sunita Devi',
    age: 38,
    gender: 'Female',
    phone: '+91 98123 55678',
    symptoms: ['Severe Bleeding', 'Compound Fracture'],
    duration_days: 1,
    severity_1to10: 8,
    bp: '90/60',
    pulse: 125,
    temp_f: 99.1,
    spo2: 94,
    triage_level: 'RED',
    triage_reason: 'CRITICAL: Massive blood loss & hypotensive BP 90/60.',
    registered_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'PAT-8493',
    full_name: 'Ramesh Patel',
    age: 45,
    gender: 'Male',
    phone: '+91 97654 32109',
    symptoms: ['Fever', 'Abdominal Pain'],
    duration_days: 4,
    severity_1to10: 6,
    bp: '120/80',
    pulse: 92,
    temp_f: 102.4,
    spo2: 96,
    triage_level: 'YELLOW',
    triage_reason: 'URGENT: High fever >3 days & severe abdominal tenderness.',
    registered_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

const HealthcareContext = createContext<HealthcareContextType | undefined>(undefined);

export function HealthcareProvider({ children }: { children: React.ReactNode }) {
  const [facilities, setFacilities] = useState<FacilityDetail[]>(INITIAL_FACILITIES);
  const [bloodInventory, setBloodInventory] = useState<Record<string, Record<BloodType, number>>>(INITIAL_BLOOD);
  const [patients, setPatients] = useState<PatientRecord[]>(INITIAL_PATIENTS);
  const [incomingReferrals, setIncomingReferrals] = useState<PatientRecord[]>([]);
  const [holdSuccessMsg, setHoldSuccessMsg] = useState<string | null>(null);

  const supabase = createClient();

  // Load from Supabase or fallback state
  useEffect(() => {
    async function loadSupabaseData() {
      const { data: dbFacs } = await supabase.from('facilities').select('*');
      if (dbFacs && dbFacs.length > 0) {
        const merged = INITIAL_FACILITIES.map(f => {
          const match = dbFacs.find(df => df.hfr_id === f.hfr_id);
          if (match) {
            return {
              ...f,
              general_beds_avail: match.available_beds,
              general_beds_total: match.total_beds,
            };
          }
          return f;
        });
        setFacilities(merged);
      }

      const { data: dbBlood } = await supabase.from('blood_inventory').select('*');
      if (dbBlood && dbBlood.length > 0) {
        const bloodMap: Record<string, Record<BloodType, number>> = { ...INITIAL_BLOOD };
        dbBlood.forEach(item => {
          if (!bloodMap[item.facility_hfr_id]) bloodMap[item.facility_hfr_id] = {} as any;
          bloodMap[item.facility_hfr_id][item.blood_type as BloodType] = item.available_units;
        });
        setBloodInventory(bloodMap);
      }

      // Fetch patients from Supabase if patients table exists
      const { data: dbPatients } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
      if (dbPatients && dbPatients.length > 0) {
        const mappedPatients: PatientRecord[] = dbPatients.map((p: any) => ({
          id: p.id,
          full_name: p.full_name,
          age: p.age,
          gender: p.gender,
          phone: p.phone,
          symptoms: p.symptoms || [],
          duration_days: p.duration_days || 1,
          severity_1to10: p.severity_1to10 || 5,
          bp: p.bp || '120/80',
          pulse: p.pulse || 80,
          temp_f: p.temp_f || 98.6,
          spo2: p.spo2 || 97,
          triage_level: p.triage_level || 'GREEN',
          triage_reason: p.triage_reason || 'Initial Assessment',
          registered_at: p.created_at || new Date().toISOString(),
          referral_pass: p.referral_pass ? JSON.parse(p.referral_pass) : undefined,
        }));
        setPatients(mappedPatients);
      }
    }
    loadSupabaseData();
  }, []);

  const updateBedCapacity = async (facilityId: string, updates: { general?: number; emergency?: number; icu?: number; ventilators?: number }) => {
    setFacilities(prev =>
      prev.map(f => {
        if (f.hfr_id === facilityId) {
          return {
            ...f,
            general_beds_avail: updates.general !== undefined ? updates.general : f.general_beds_avail,
            emergency_beds_avail: updates.emergency !== undefined ? updates.emergency : f.emergency_beds_avail,
            icu_beds_avail: updates.icu !== undefined ? updates.icu : f.icu_beds_avail,
            ventilators_free: updates.ventilators !== undefined ? updates.ventilators : f.ventilators_free,
          };
        }
        return f;
      })
    );

    if (updates.general !== undefined) {
      await supabase.from('facilities').update({ available_beds: updates.general }).eq('hfr_id', facilityId);
    }
  };

  const updateBloodUnit = async (facilityId: string, bloodType: BloodType, count: number) => {
    const validCount = Math.max(0, count);
    setBloodInventory(prev => ({
      ...prev,
      [facilityId]: {
        ...(prev[facilityId] || {}),
        [bloodType]: validCount,
      },
    }));

    await supabase.from('blood_inventory').upsert({
      facility_hfr_id: facilityId,
      blood_type: bloodType,
      available_units: validCount,
      last_updated: new Date().toISOString(),
    }, { onConflict: 'facility_hfr_id,blood_type' });
  };

  const registerPatient = (patientData: Omit<PatientRecord, 'id' | 'registered_at'>): PatientRecord => {
    const newId = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: PatientRecord = {
      ...patientData,
      id: newId,
      registered_at: new Date().toISOString(),
    };

    setPatients(prev => [newRecord, ...prev]);

    // Async insert to Supabase patients table
    supabase.from('patients').insert({
      id: newRecord.id,
      full_name: newRecord.full_name,
      age: newRecord.age,
      gender: newRecord.gender,
      phone: newRecord.phone,
      symptoms: newRecord.symptoms,
      duration_days: newRecord.duration_days,
      severity_1to10: newRecord.severity_1to10,
      bp: newRecord.bp,
      pulse: newRecord.pulse,
      temp_f: newRecord.temp_f,
      spo2: newRecord.spo2,
      triage_level: newRecord.triage_level,
      triage_reason: newRecord.triage_reason,
      created_at: newRecord.registered_at,
    }).then(({ error }) => {
      if (error) console.error('Supabase patient insert info:', error.message);
    });

    return newRecord;
  };


  const issueDirectReferral = (patientId: string, facilityId: string, doctorNotes: string): PatientRecord | null => {
    const targetFac = facilities.find(f => f.hfr_id === facilityId) || facilities[0];
    const passId = `REF-PASS-${Math.floor(100000 + Math.random() * 900000)}`;

    let updatedPatient: PatientRecord | null = null;

    setPatients(prev =>
      prev.map(p => {
        if (p.id === patientId) {
          updatedPatient = {
            ...p,
            referral_pass: {
              pass_id: passId,
              target_facility_name: targetFac.name,
              target_facility_id: targetFac.hfr_id,
              eta_mins: Math.round(targetFac.distance_km * 3 + 10),
              doctor_notes: doctorNotes || 'Priority emergency transfer authorized by Rural Doctor.',
              issued_at: new Date().toISOString(),
            },
          };
          return updatedPatient;
        }
        return p;
      })
    );

    if (updatedPatient) {
      setIncomingReferrals(prev => [updatedPatient!, ...prev]);
    }

    return updatedPatient;
  };

  const holdBloodRequest = (facilityId: string, bloodType: BloodType) => {
    const fac = facilities.find(f => f.hfr_id === facilityId);
    setHoldSuccessMsg(`Hold request issued for 1 unit of ${bloodType} at ${fac?.name || 'Blood Bank'}. Valid for 2 hours.`);
    setTimeout(() => setHoldSuccessMsg(null), 5000);
  };

  return (
    <HealthcareContext.Provider
      value={{
        facilities,
        bloodInventory,
        patients,
        incomingReferrals,
        updateBedCapacity,
        updateBloodUnit,
        registerPatient,
        issueDirectReferral,
        holdBloodRequest,
        holdSuccessMsg,
      }}
    >
      {children}
    </HealthcareContext.Provider>
  );
}

export function useHealthcare() {
  const context = useContext(HealthcareContext);
  if (!context) {
    throw new Error('useHealthcare must be used within a HealthcareProvider');
  }
  return context;
}
