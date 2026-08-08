'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Building2, Stethoscope, ClipboardList } from 'lucide-react';

export default function RoleNavigationHeader() {
  const pathname = usePathname();

  const roles = [
    { name: 'Patient', href: '/patient', icon: User },
    { name: 'PHC Worker', href: '/phc', icon: Building2 },
    { name: 'Doctor', href: '/hospital', icon: Stethoscope },
    { name: 'Receptionist', href: '/receptionist', icon: ClipboardList },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pt-4 relative z-20">
      <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-sky-100 shadow-sm flex items-center justify-between gap-1 overflow-x-auto">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-space px-3 hidden md:inline-block">
          Demo Role Switcher:
        </span>
        <div className="flex items-center gap-1.5 w-full md:w-auto justify-between md:justify-end">
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = pathname === r.href;
            return (
              <Link
                key={r.href}
                href={r.href}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-space transition-all duration-200 ${
                  isActive
                    ? 'bg-[#0284C7] text-white shadow-[0_4px_12px_rgba(2,132,199,0.25)] font-extrabold'
                    : 'text-slate-600 hover:text-[#0284C7] hover:bg-sky-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{r.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
