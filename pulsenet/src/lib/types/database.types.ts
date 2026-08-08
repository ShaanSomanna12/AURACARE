export type UserRole = 'CUSTOMER_PHC' | 'DOCTOR_ADMIN';

export type TriageLevel = 'RED' | 'YELLOW' | 'GREEN';

export type ReferralStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'TRANSFERRED';

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface Profile {
  id: string; // UUID referencing auth.users(id)
  email: string;
  full_name: string;
  role: UserRole;
  facility_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Facility {
  hfr_id: string;
  name: string;
  latitude: number;
  longitude: number;
  total_beds: number;
  available_beds: number;
  last_synced: string;
}

export interface BloodInventory {
  id: string; // UUID
  facility_hfr_id: string;
  blood_type: BloodType;
  available_units: number;
  last_updated: string;
}

export interface Referral {
  id: string; // UUID
  patient_name: string;
  referrer_id: string;
  target_facility_id: string;
  triage_status: TriageLevel;
  symptoms: string | null;
  requested_blood_type: BloodType | null;
  requested_blood_units: number | null;
  status: ReferralStatus;
  created_at: string;
  updated_at: string;
}

// Supabase Database Type Definition (for typed Supabase client)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string };
        Update: Partial<Omit<Profile, 'id'>>;
      };
      facilities: {
        Row: Facility;
        Insert: Omit<Facility, 'last_synced'> & { last_synced?: string };
        Update: Partial<Omit<Facility, 'hfr_id'>>;
      };
      blood_inventory: {
        Row: BloodInventory;
        Insert: Omit<BloodInventory, 'id' | 'last_updated'> & { id?: string; last_updated?: string };
        Update: Partial<Omit<BloodInventory, 'id'>>;
      };
      referrals: {
        Row: Referral;
        Insert: Omit<Referral, 'id' | 'status' | 'created_at' | 'updated_at'> & { 
          id?: string; 
          status?: ReferralStatus;
          created_at?: string; 
          updated_at?: string; 
        };
        Update: Partial<Omit<Referral, 'id'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      triage_level: TriageLevel;
      referral_status: ReferralStatus;
    };
  };
}
