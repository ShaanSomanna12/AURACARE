'use client';

import { motion } from 'framer-motion';
import type { BloodType } from '@/lib/types/database.types';

const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

type BloodToggleProps = {
  selected: BloodType | null;
  onChange: (type: BloodType) => void;
};

export default function BloodToggle({ selected, onChange }: BloodToggleProps) {
  return (
    <div className="grid grid-cols-4 gap-3 w-full">
      {BLOOD_TYPES.map((type) => {
        const isSelected = selected === type;
        return (
          <motion.button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`
              relative flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 font-space transition-all duration-200 shadow-sm
              ${isSelected 
                ? 'bg-[#F0F9FF] border-[#0284C7] text-[#0284C7] shadow-[0_4px_12px_rgba(2,132,199,0.15)] font-extrabold' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-sky-300 hover:bg-sky-50/50 font-bold'}
            `}
          >
            <span className="text-lg tracking-tight z-10">{type}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

