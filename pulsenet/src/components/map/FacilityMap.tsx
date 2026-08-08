'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Building2 } from 'lucide-react';
import type { Facility } from '@/lib/types/database.types';


type FacilityMapProps = {
  facilities: Facility[];
  onSelectFacility: (hfr_id: string) => void;
};

export default function FacilityMap({ facilities, onSelectFacility }: FacilityMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const onSelectRef = useRef(onSelectFacility);
  onSelectRef.current = onSelectFacility;

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!token) return;
    if (map.current || !mapContainer.current) return; // initialize map only once

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Cyber-Industrial Dark Mode
      center: [76.90021, 12.52605], // Default center (Mandya, Karnataka)
      zoom: 13,
      pitch: 45, // Add some pitch for a 3D tactical look

    });

    // Add markers when map loads
    map.current.on('load', () => {
      facilities.forEach((facility) => {
        // Create custom glowing marker element
        const el = document.createElement('div');
        el.className = 'w-4 h-4 rounded-full bg-[var(--color-electric-indigo)] cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.8)] border-2 border-white/80';
        
        el.addEventListener('click', () => {
          if (onSelectRef.current) {
            onSelectRef.current(facility.hfr_id);
          }
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
  }, [facilities, token]);

  if (!token) {
    return (
      <div className="w-full bg-[#F8FAFC] border border-sky-100 rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-inner">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-5 h-5 text-[#0284C7]" />
          <h3 className="text-slate-800 font-space font-extrabold text-base">Select Hospital Destination</h3>
        </div>
        <p className="text-slate-500 text-xs font-medium max-w-md mb-5">
          Live hospital Registry active. Select an available facility below to transmit emergency transfer request.
        </p>
        
        {/* Facility Selection List */}
        <div className="grid grid-cols-1 gap-3 w-full max-w-md">
          {facilities.length > 0 ? facilities.map(f => (
             <button 
               key={f.hfr_id}
               type="button"
               onClick={() => onSelectFacility(f.hfr_id)}
               className="py-3.5 px-5 bg-white hover:bg-sky-50 border-2 border-slate-200 hover:border-[#0284C7] rounded-2xl text-left transition-all shadow-sm flex items-center justify-between group"
             >
               <div>
                 <p className="font-space font-extrabold text-slate-800 text-sm group-hover:text-[#0284C7] transition-colors">{f.name}</p>
                 <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                   <span className="w-2 h-2 rounded-full bg-emerald-500" />
                   {f.available_beds} beds available
                 </span>
               </div>
               <span className="py-2 px-3 bg-[#0284C7] group-hover:bg-[#0369A1] text-white font-bold text-xs font-space rounded-xl shadow-sm">
                 Transfer Here
               </span>
             </button>
          )) : (
             <button 
               type="button"
               onClick={() => onSelectFacility('FAC-001')}
               className="py-3.5 px-5 bg-white hover:bg-sky-50 border-2 border-[#0284C7] rounded-2xl text-left transition-all shadow-sm flex items-center justify-between group"
             >
               <div>
                 <p className="font-space font-extrabold text-slate-800 text-sm group-hover:text-[#0284C7]">City General Hospital (Command Center)</p>
                 <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                   <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   42 beds available • e-RaktKosh Live
                 </span>
               </div>
               <span className="py-2 px-3 bg-[#0284C7] text-white font-bold text-xs font-space rounded-xl shadow-sm">
                 Transfer Here
               </span>
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
