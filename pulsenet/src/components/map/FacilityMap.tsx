'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Facility } from '@/lib/types/database.types';

type FacilityMapProps = {
  facilities: Facility[];
  onSelectFacility: (hfr_id: string) => void;
};

export default function FacilityMap({ facilities, onSelectFacility }: FacilityMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [tokenMissing, setTokenMissing] = useState(false);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      setTokenMissing(true);
      return;
    }

    if (map.current || !mapContainer.current) return; // initialize map only once

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Cyber-Industrial Dark Mode
      center: [77.5946, 12.9716], // Default center (Bangalore approx)
      zoom: 11,
      pitch: 45, // Add some pitch for a 3D tactical look
    });

    // Add markers when map loads
    map.current.on('load', () => {
      facilities.forEach((facility) => {
        // Create custom glowing marker element
        const el = document.createElement('div');
        el.className = 'w-4 h-4 rounded-full bg-[var(--color-electric-indigo)] cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.8)] border-2 border-white/80';
        
        el.addEventListener('click', () => {
          onSelectFacility(facility.hfr_id);
        });

        // Add to map
        new mapboxgl.Marker(el)
          .setLngLat([facility.longitude, facility.latitude])
          .addTo(map.current!);
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [facilities, onSelectFacility]);

  if (tokenMissing) {
    return (
      <div className="w-full h-[400px] bg-black/40 border border-white/10 rounded-lg flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-[var(--color-electric-indigo)] border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-[var(--color-cyan-glow)] font-space font-bold uppercase tracking-widest text-sm mb-2">Tactical Map Offline</h3>
        <p className="text-white/40 text-xs">Awaiting MAPBOX_TOKEN configuration. Simulating facility data integration...</p>
        
        {/* Mock Facility Selection for Hackathon Continuation */}
        <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
          {facilities.length > 0 ? facilities.map(f => (
             <button 
               key={f.hfr_id}
               onClick={() => onSelectFacility(f.hfr_id)}
               className="py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-sm text-white transition-colors"
             >
               {f.name} ({f.available_beds} beds)
             </button>
          )) : (
             <button 
               onClick={() => onSelectFacility('FAC-001')}
               className="py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-sm text-white transition-colors"
             >
               Fallback Facility (FAC-001)
             </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border border-white/10 text-xs font-mono text-[var(--color-cyan-glow)] uppercase">
        Live Tactical Feed
      </div>
    </div>
  );
}
