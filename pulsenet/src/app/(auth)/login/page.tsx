'use client';

import { useState, useTransition } from 'react';
import { Activity, Lock, Mail, AlertCircle } from 'lucide-react';
import { loginUser } from './actions';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await loginUser(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top_right,_var(--color-electric-indigo)_0%,_transparent_40%),_radial-gradient(ellipse_at_bottom_left,_var(--color-cyan-glow)_0%,_transparent_40%)] opacity-20" />

      <div className="w-full max-w-md glass-card rounded-2xl p-8 relative overflow-hidden">
        {/* Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-cyan-glow)] via-[var(--color-electric-indigo)] to-[var(--color-cyan-glow)]" />

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <Activity className="w-8 h-8 text-[var(--color-cyan-glow)]" />
          </div>
          <h1 className="text-3xl font-space font-bold text-white tracking-tight">TVARIT</h1>
          <p className="text-white/50 font-sans mt-2">Cyber-Industrial Operations</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-[var(--color-triage-red)]/10 border border-[var(--color-triage-red)]/50 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[var(--color-triage-red)]" />
              <span className="text-sm text-[var(--color-triage-red)] font-bold">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="email"
                name="email"
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/30 outline-none focus-ring-cyan transition-all"
                placeholder="Operator ID (Email)"
                defaultValue="worker@test.com"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="password"
                name="password"
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/30 outline-none focus-ring-cyan transition-all"
                placeholder="Passcode"
                defaultValue="password123"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-4 bg-[var(--color-electric-indigo)] hover:bg-indigo-500 text-white font-space font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? 'Authenticating...' : 'Initialize Session'}
          </button>
        </form>
      </div>
    </div>
  );
}
