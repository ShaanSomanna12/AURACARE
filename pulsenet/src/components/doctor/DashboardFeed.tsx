'use client';

import { useState } from 'react';

import { motion } from 'framer-motion';
import { AlertCircle, Droplet, Clock, CheckCircle, Activity } from 'lucide-react';
import type { Referral } from '@/lib/types/database.types';
import Badge from '../ui/Badge';

type DashboardFeedProps = {
  referrals: Referral[];
  onAccept: (id: string) => Promise<{ success: boolean; briefing: string | null }>;
};

export default function DashboardFeed({ referrals, onAccept }: DashboardFeedProps) {
  const [briefings, setBriefings] = useState<Record<string, string>>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const handleAccept = async (id: string) => {
    setLoadingIds(prev => new Set(prev).add(id));
    const result = await onAccept(id);
    if (result.success && result.briefing) {
      setBriefings(prev => ({ ...prev, [id]: result.briefing! }));
    }
    setLoadingIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };
  if (referrals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass-card rounded-xl border border-white/5">
        <CheckCircle className="w-12 h-12 text-[var(--color-triage-green)] mb-4 opacity-50" />
        <p className="text-white/50 font-space uppercase tracking-widest text-sm">No incoming emergencies</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {referrals.map((ref, index) => (
        <motion.div
          key={ref.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card hover:glass-card-hover rounded-xl p-5 grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-6 transition-all duration-300"
        >
          {/* Status Column */}
          <div className="flex flex-col items-start gap-3 min-w-[120px] border-r border-white/10 pr-6">
            <Badge 
              status={ref.triage_status === 'RED' ? 'CRITICAL' : ref.triage_status === 'YELLOW' ? 'CALIBRATING' : 'ONLINE'} 
              label={`TRIAGE ${ref.triage_status}`} 
            />
            <div className="flex items-center gap-2 text-white/40 text-xs font-space mt-auto">
              <Clock className="w-3 h-3" /> {new Date(ref.created_at).toLocaleTimeString()}
            </div>
          </div>

          {/* Details Column */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white font-space mb-1">{ref.patient_name}</h3>
            <p className="text-white/60 text-sm mb-4 line-clamp-2">{ref.symptoms}</p>
            
            {ref.requested_blood_type && (
              <div className="inline-flex items-center gap-2 bg-black/40 border border-[var(--color-cyan-glow)]/30 rounded-md px-3 py-1.5 text-xs font-bold text-[var(--color-cyan-glow)]">
                <Droplet className="w-3.5 h-3.5 fill-current" />
                REQUIRES: {ref.requested_blood_units} UNITS OF {ref.requested_blood_type}
              </div>
            )}
          </div>

          {/* Action Column */}
          <div className="flex flex-col justify-center min-w-[200px]">
            {ref.status === 'PENDING' ? (
              <button 
                onClick={() => handleAccept(ref.id)}
                disabled={loadingIds.has(ref.id)}
                className="w-full py-3 bg-[var(--color-electric-indigo)] hover:bg-[var(--color-electric-indigo)]/80 text-white text-sm font-bold font-space uppercase tracking-wider rounded-lg transition-all focus-ring-cyan flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.3)] disabled:opacity-50"
              >
                <AlertCircle className="w-4 h-4" />
                {loadingIds.has(ref.id) ? 'Analyzing...' : 'Accept & Lock'}
              </button>
            ) : (
              <div className="w-full flex flex-col gap-2">
                <div className="w-full py-3 bg-white/5 border border-white/10 text-white/50 text-sm font-bold font-space uppercase tracking-wider rounded-lg flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[var(--color-triage-green)]" />
                  Accepted
                </div>
              </div>
            )}
          </div>
          
          {/* AI Pre-Arrival Briefing Expansion */}
          {ref.status === 'ACCEPTED' && briefings[ref.id] && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className="mt-4 p-4 rounded-lg bg-[var(--color-electric-indigo)]/10 border border-[var(--color-electric-indigo)]/30 w-full col-span-full md:col-span-3 lg:col-span-3"
            >
              <h4 className="text-[var(--color-cyan-glow)] font-space font-bold uppercase tracking-widest text-xs mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" /> AI Pre-Arrival Briefing
              </h4>
              <div className="text-white/80 font-sans text-sm whitespace-pre-wrap">
                {briefings[ref.id]}
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
