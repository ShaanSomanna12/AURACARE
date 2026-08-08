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
            onClick={() => onChange(type)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              relative flex flex-col items-center justify-center p-3 rounded-md transition-all duration-200
              ${isSelected 
                ? 'bg-white/10 text-white border-b-2 border-[var(--color-electric-indigo)] focus-ring-cyan' 
                : 'bg-black/20 text-white/50 border border-white/5 hover:bg-white/5'}
            `}
          >
            {/* Inner glow effect for selected state */}
            {isSelected && (
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-electric-indigo)]/20 to-transparent rounded-md pointer-events-none" />
            )}
            <span className="font-sans font-bold text-lg z-10">{type}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
