'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, AlertCircle, ArrowRight, UserPlus, LogIn, Activity, Building2, Stethoscope } from 'lucide-react';
import Image from 'next/image';
import { loginUser, signUpUser } from './actions';

type AuthMode = 'LOGIN' | 'SIGNUP';
type Role = 'CUSTOMER_PHC' | 'DOCTOR_ADMIN';

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [role, setRole] = useState<Role>('CUSTOMER_PHC');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    // If sign up, we must append the selected role manually since it's not a standard input
    if (mode === 'SIGNUP') {
      formData.append('role', role);
    }
    
    startTransition(async () => {
      const result = mode === 'LOGIN' ? await loginUser(formData) : await signUpUser(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  const toggleMode = () => {
    setError(null);
    setMode(prev => prev === 'LOGIN' ? 'SIGNUP' : 'LOGIN');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050B14] relative overflow-hidden font-sans text-slate-200">
      
      {/* 🌌 STUNNING ANIMATED BACKGROUND 🌌 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(6,182,212,0.05)_0%,_transparent_100%)]" />
        
        {/* Floating Neon Orbs */}
        <motion.div 
          animate={{ y: [0, -40, 0], x: [0, 30, 0], scale: [1, 1.2, 1] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[15%] w-96 h-96 bg-[var(--color-electric-indigo)] rounded-full mix-blend-screen filter blur-[120px] opacity-20 z-0" 
        />
        <motion.div 
          animate={{ y: [0, 50, 0], x: [0, -20, 0], scale: [1, 1.5, 1] }} 
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] right-[15%] w-[30rem] h-[30rem] bg-[var(--color-triage-red)] rounded-full mix-blend-screen filter blur-[150px] opacity-10 z-0" 
        />
        <motion.div 
          animate={{ y: [0, -20, 0], x: [0, -40, 0], scale: [1, 1.1, 1] }} 
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] right-[30%] w-80 h-80 bg-[var(--color-cyan-glow)] rounded-full mix-blend-screen filter blur-[100px] opacity-20 z-0" 
        />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* 🚀 LOGIN/SIGNUP CARD 🚀 */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="glass-card rounded-[2rem] p-8 sm:p-10 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden backdrop-blur-2xl bg-[#0B101E]/60">
          
          {/* Animated border glow line at the top */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--color-cyan-glow)] to-transparent"
            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: '200% 100%' }}
          />

          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8 relative">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
              className="relative w-full flex justify-center mb-6"
            >
              {/* Fallback glow if image is missing */}
              <div className="absolute inset-0 bg-[var(--color-triage-red)] blur-3xl opacity-20 rounded-full" />
              
              <div className="relative w-32 h-32 flex items-center justify-center">
                <Image 
                  src="/logo.png" 
                  alt="Tvarit Logo" 
                  fill
                  className="object-contain drop-shadow-[0_0_25px_rgba(239,68,68,0.4)]"
                  priority
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <h1 className="text-3xl font-space font-bold text-white tracking-wider mb-2">TVARIT</h1>
              <p className="text-white/50 text-sm tracking-widest uppercase">
                {mode === 'LOGIN' ? 'Session Initialization' : 'Operator Registration'}
              </p>
            </motion.div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 rounded-xl bg-[var(--color-triage-red)]/10 border border-[var(--color-triage-red)]/30 flex items-center gap-3 backdrop-blur-md">
                    <AlertCircle className="w-5 h-5 text-[var(--color-triage-red)] flex-shrink-0" />
                    <span className="text-sm text-red-200 font-medium">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              className="space-y-4"
              initial={false}
              animate={{ opacity: 1 }}
            >
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-[var(--color-cyan-glow)] transition-colors" />
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/30 outline-none focus:border-[var(--color-cyan-glow)] focus:bg-black/60 transition-all font-sans shadow-inner"
                  placeholder="Operator ID (Email)"
                  defaultValue={mode === 'LOGIN' ? 'worker@test.com' : ''}
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-[var(--color-cyan-glow)] transition-colors" />
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/30 outline-none focus:border-[var(--color-cyan-glow)] focus:bg-black/60 transition-all font-sans shadow-inner"
                  placeholder="Passcode"
                  defaultValue={mode === 'LOGIN' ? 'password123' : ''}
                />
              </div>

              {/* ROLE SELECTOR (Only shown in Sign Up mode) */}
              <AnimatePresence>
                {mode === 'SIGNUP' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-2 overflow-hidden"
                  >
                    <label className="block text-xs font-space text-white/50 uppercase tracking-widest mb-3 text-center">Select Operator Role</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setRole('CUSTOMER_PHC')}
                        className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                          role === 'CUSTOMER_PHC' 
                            ? 'bg-[var(--color-cyan-glow)]/20 border-[var(--color-cyan-glow)] shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                            : 'bg-black/40 border-white/10 hover:border-white/30 text-white/50'
                        }`}
                      >
                        <Building2 className={`w-6 h-6 ${role === 'CUSTOMER_PHC' ? 'text-[var(--color-cyan-glow)]' : ''}`} />
                        <span className={`text-xs font-bold ${role === 'CUSTOMER_PHC' ? 'text-white' : ''}`}>PHC Worker</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setRole('DOCTOR_ADMIN')}
                        className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                          role === 'DOCTOR_ADMIN' 
                            ? 'bg-[var(--color-triage-red)]/20 border-[var(--color-triage-red)] shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                            : 'bg-black/40 border-white/10 hover:border-white/30 text-white/50'
                        }`}
                      >
                        <Stethoscope className={`w-6 h-6 ${role === 'DOCTOR_ADMIN' ? 'text-[var(--color-triage-red)]' : ''}`} />
                        <span className={`text-xs font-bold ${role === 'DOCTOR_ADMIN' ? 'text-white' : ''}`}>Hospital Doctor</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isPending}
              className={`w-full py-4 mt-4 text-white font-space font-bold tracking-widest uppercase rounded-xl transition-all flex items-center justify-center gap-3 group relative overflow-hidden
                ${mode === 'LOGIN' 
                  ? 'bg-[var(--color-electric-indigo)] hover:bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]' 
                  : 'bg-[var(--color-cyan-glow)] hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] text-black'
                }`}
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              {isPending ? (
                <div className="flex items-center gap-2 z-10 relative">
                  <Activity className="w-5 h-5 animate-pulse" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 z-10 relative">
                  {mode === 'LOGIN' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  <span>{mode === 'LOGIN' ? 'Initiate Session' : 'Create Account'}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </motion.button>
          </form>

          {/* Toggle Mode Button */}
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-white/50 hover:text-white text-sm font-sans transition-colors border-b border-transparent hover:border-white/50 pb-0.5"
            >
              {mode === 'LOGIN' ? "Need a clearance code? Sign Up" : "Already have clearance? Log In"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
