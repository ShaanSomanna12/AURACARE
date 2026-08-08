'use client';

import { useEffect, useState } from 'react';
import type { Referral } from '@/lib/types/database.types';
import { createClient } from '@/lib/supabase/client';
import DashboardFeed from './DashboardFeed';

type RealtimeDashboardFeedProps = {
  initialReferrals: Referral[];
  onAccept: (id: string) => Promise<{ success: boolean; briefing: string | null }>;
  facilityId: string;
};

export default function RealtimeDashboardFeed({ initialReferrals, onAccept, facilityId }: RealtimeDashboardFeedProps) {
  const [referrals, setReferrals] = useState<Referral[]>(initialReferrals);

  useEffect(() => {
    const supabase = createClient();
    const channelName = `public:referrals:${facilityId}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'referrals', filter: `target_facility_id=eq.${facilityId}` },
        (payload) => {
          const newReferral = payload.new as Referral;
          setReferrals((prev) => [newReferral, ...prev].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'referrals', filter: `target_facility_id=eq.${facilityId}` },
        (payload) => {
          const updatedReferral = payload.new as Referral;
          setReferrals((prev) => prev.map((r) => r.id === updatedReferral.id ? updatedReferral : r));
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime WebSocket Connected:', facilityId);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime WebSocket Disconnected');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [facilityId]);

  return <DashboardFeed referrals={referrals} onAccept={onAccept} />;
}

