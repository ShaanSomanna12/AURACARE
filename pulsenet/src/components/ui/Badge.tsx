'use client';

import { motion } from 'framer-motion';

type BadgeProps = {
  status: 'ONLINE' | 'CALIBRATING' | 'CRITICAL' | 'DEFAULT';
  label: string;
};

export default function Badge({ status, label }: BadgeProps) {
  let dotColor = '';
  let pulseDuration = 2;

  switch (status) {
    case 'ONLINE':
      dotColor = 'bg-[var(--color-triage-green)]';
      pulseDuration = 3;
      break;
    case 'CALIBRATING':
      dotColor = 'bg-[var(--color-triage-yellow)]';
      pulseDuration = 1.5;
      break;
    case 'CRITICAL':
      dotColor = 'bg-[var(--color-triage-red)]';
      pulseDuration = 0.8; // Fast pulse
      break;
    default:
      dotColor = 'bg-[var(--color-medical-blue)]';
      pulseDuration = 4;
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 shadow-sm">
      <div className="relative flex h-2.5 w-2.5 items-center justify-center">
        <motion.div
          animate={{ scale: [1, 2, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ repeat: Infinity, duration: pulseDuration, ease: "easeInOut" }}
          className={`absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`}
        />
        <div className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
      </div>
      <span className="text-xs font-bold tracking-widest text-white/90 font-sans uppercase">
        {label}
      </span>
    </div>
  );
}
