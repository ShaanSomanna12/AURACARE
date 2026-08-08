-- ==========================================
-- PULSENET PHASE 6 HACKATHON SEED DATA
-- ==========================================

-- 1. Clear existing data (to allow re-running this script cleanly)
TRUNCATE TABLE public.referrals CASCADE;
TRUNCATE TABLE public.blood_inventory CASCADE;
TRUNCATE TABLE public.facilities CASCADE;

-- 2. Insert Mock Facilities (Hospitals)
INSERT INTO public.facilities (hfr_id, name, latitude, longitude, total_beds, available_beds) VALUES
('FAC-001', 'City General Hospital (Command Center)', 12.9716, 77.5946, 500, 42),
('FAC-002', 'Metro Trauma Center', 12.9352, 77.6245, 300, 15),
('FAC-003', 'Rural Care Clinic', 13.0358, 77.5970, 50, 5);

-- 3. Insert Blood Inventory for FAC-001 (The Doctor's Hospital)
INSERT INTO public.blood_inventory (facility_hfr_id, blood_type, available_units) VALUES
('FAC-001', 'O+', 12),
('FAC-001', 'O-', 4),
('FAC-001', 'A+', 25),
('FAC-001', 'A-', 2),
('FAC-001', 'B+', 18),
('FAC-001', 'B-', 5),
('FAC-001', 'AB+', 8),
('FAC-001', 'AB-', 1);

-- 4. Insert Blood Inventory for other hospitals
INSERT INTO public.blood_inventory (facility_hfr_id, blood_type, available_units) VALUES
('FAC-002', 'O-', 15),
('FAC-002', 'AB+', 2),
('FAC-003', 'O+', 5);

-- 5. Insert a backlog of emergencies into the Doctor's Queue (FAC-001)
-- We use a subquery to dynamically find the ID of the worker@test.com user we created earlier!
DO $$
DECLARE
    worker_uuid UUID;
BEGIN
    SELECT id INTO worker_uuid FROM public.profiles WHERE email = 'worker@test.com' LIMIT 1;
    
    IF worker_uuid IS NOT NULL THEN
        INSERT INTO public.referrals (patient_name, referrer_id, target_facility_id, triage_status, symptoms, requested_blood_type, requested_blood_units, status, created_at)
        VALUES
        ('Arjun Patel', worker_uuid, 'FAC-001', 'RED', 'Severe blunt force trauma from MVA. Unconscious, dropping BP. Suspected internal bleeding.', 'O-', 4, 'PENDING', NOW() - INTERVAL '5 minutes'),
        ('Priya Sharma', worker_uuid, 'FAC-001', 'YELLOW', 'Compound fracture in right tibia. Severe pain, stable vitals. Needs immediate orthopedic consult.', NULL, 0, 'PENDING', NOW() - INTERVAL '15 minutes'),
        ('Rajesh Kumar', worker_uuid, 'FAC-001', 'GREEN', 'Mild concussion and lacerations. Fully conscious and responsive.', NULL, 0, 'PENDING', NOW() - INTERVAL '45 minutes'),
        ('Anonymous Male', worker_uuid, 'FAC-001', 'RED', 'Gunshot wound to abdomen. Massive hemorrhage.', 'A+', 6, 'PENDING', NOW() - INTERVAL '2 minutes');
    END IF;
END $$;
