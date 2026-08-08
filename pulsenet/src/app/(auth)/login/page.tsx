'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, AlertCircle, ArrowRight, UserPlus, LogIn, Activity, Building2, Stethoscope, HeartPulse, ShieldPlus, Eye, EyeOff, User } from 'lucide-react';
import Image from 'next/image';
import { loginUser, signUpUser } from './actions';

type AuthMode = 'LOGIN' | 'SIGNUP';
type Role = 'CUSTOMER_PHC' | 'DOCTOR_ADMIN' | 'PATIENT';

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [role, setRole] = useState<Role>('CUSTOMER_PHC');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F0F9FF] relative overflow-hidden font-sans">
      
      {/* ⚕️ MEDICAL CLINICAL BACKGROUND ⚕️ */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#E0F2FE_0%,_transparent_60%),_radial-gradient(circle_at_bottom_left,_#FFFFFF_0%,_transparent_60%)]" />
        
        {/* Animated Heartbeat EKG Line Background Pattern */}
        <div className="absolute top-[20%] left-0 right-0 h-[200px] opacity-10 pointer-events-none flex items-center overflow-hidden">
           <motion.svg
             viewBox="0 0 1000 100"
             className="w-[200%] h-full stroke-[#0284C7] fill-transparent"
             style={{ strokeWidth: 2 }}
             initial={{ x: "-50%" }}
             animate={{ x: "0%" }}
             transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
           >
             <path d="M0,50 L200,50 L220,20 L240,80 L260,10 L280,90 L300,50 L500,50 L520,20 L540,80 L560,10 L580,90 L600,50 L800,50 L820,20 L840,80 L860,10 L880,90 L900,50 L1000,50" />
             <path d="M500,50 L700,50 L720,20 L740,80 L760,10 L780,90 L800,50 L1000,50 L1020,20 L1040,80 L1060,10 L1080,90 L1100,50 L1300,50 L1320,20 L1340,80 L1360,10 L1380,90 L1400,50 L1500,50" />
           </motion.svg>
        </div>

        {/* Floating Medical Icons */}
        <motion.div 
          animate={{ y: [0, -20, 0], opacity: [0.1, 0.3, 0.1] }} 
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[15%] text-[#0284C7]" 
        >
          <ShieldPlus className="w-24 h-24" />
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 30, 0], opacity: [0.1, 0.4, 0.1] }} 
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[15%] right-[15%] text-[#0369A1]" 
        >
          <HeartPulse className="w-32 h-32" />
        </motion.div>

        {/* Clean Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(2,132,199,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(2,132,199,0.05)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)]" />
      </div>

      {/* 🏥 CLINICAL LOGIN CARD 🏥 */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(2,132,199,0.15)] border border-[#E0F2FE] relative overflow-hidden">
          
          {/* Medical Blue Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0EA5E9] via-[#0284C7] to-[#0EA5E9]" />

          {/* Clean Medical Logo Area */}
          <div className="w-full bg-[#FAFAFA] pt-10 pb-6 flex flex-col items-center relative overflow-hidden rounded-t-3xl border-b border-slate-100">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
              className="relative w-full flex justify-center z-10"
            >
              <div className="relative w-32 h-32 flex items-center justify-center bg-[#0B0F19] rounded-full shadow-lg border-4 border-white p-4">
                <Image 
                  src="/logo.png" 
                  alt="Tvarit Logo" 
                  fill
                  className="object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] p-4"
                  priority
                />
              </div>
            </motion.div>
          </div>

          <div className="p-8 sm:p-10 pt-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <h1 className="text-2xl font-space font-bold text-slate-800 tracking-tight mb-1">
                {mode === 'LOGIN' ? 'Tvarit Health Portal' : 'Join Tvarit Network'}
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                {mode === 'LOGIN' ? 'Secure authentication for medical staff' : 'Register your medical credentials'}
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span className="text-sm text-red-700 font-semibold">{error}</span>
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
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#0284C7] transition-colors" />
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-800 placeholder-slate-400 outline-none focus:border-[#0284C7] focus:bg-white focus:ring-4 focus:ring-[#0284C7]/10 transition-all font-sans font-medium"
                    placeholder="Staff Email Address"
                    defaultValue={mode === 'LOGIN' ? 'worker@test.com' : ''}
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#0284C7] transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl py-4 pl-12 pr-12 text-slate-800 placeholder-slate-400 outline-none focus:border-[#0284C7] focus:bg-white focus:ring-4 focus:ring-[#0284C7]/10 transition-all font-sans font-medium"
                    placeholder="Secure Password"
                    defaultValue={mode === 'LOGIN' ? 'password123' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0284C7] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* ROLE SELECTOR */}
                <AnimatePresence>
                  {mode === 'SIGNUP' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-2 overflow-hidden"
                    >
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">Select Department Role</label>
                      <div className="flex gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={() => setRole('PATIENT')}
                          className={`flex-1 flex flex-col items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-2xl border-2 transition-all ${
                            role === 'PATIENT' 
                              ? 'bg-[#F0F9FF] border-[#0284C7] text-[#0284C7]' 
                              : 'bg-white border-slate-100 hover:border-[#0284C7]/30 text-slate-400 hover:text-slate-500'
                          }`}
                        >
                          <User className="w-5 h-5 sm:w-6 sm:h-6" />
                          <span className="text-[10px] sm:text-xs font-bold text-center">Patient</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRole('CUSTOMER_PHC')}
                          className={`flex-1 flex flex-col items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-2xl border-2 transition-all ${
                            role === 'CUSTOMER_PHC' 
                              ? 'bg-[#F0F9FF] border-[#0284C7] text-[#0284C7]' 
                              : 'bg-white border-slate-100 hover:border-[#0284C7]/30 text-slate-400 hover:text-slate-500'
                          }`}
                        >
                          <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                          <span className="text-[10px] sm:text-xs font-bold text-center">PHC Worker</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setRole('DOCTOR_ADMIN')}
                          className={`flex-1 flex flex-col items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-2xl border-2 transition-all ${
                            role === 'DOCTOR_ADMIN' 
                              ? 'bg-[#F0F9FF] border-[#0284C7] text-[#0284C7]' 
                              : 'bg-white border-slate-100 hover:border-[#0284C7]/30 text-slate-400 hover:text-slate-500'
                          }`}
                        >
                          <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />
                          <span className="text-[10px] sm:text-xs font-bold text-center">Hospital Doctor</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isPending}
                className="w-full py-4 mt-4 bg-[#0284C7] hover:bg-[#0369A1] text-white font-space font-bold tracking-wide rounded-2xl transition-all shadow-[0_8px_20px_rgba(2,132,199,0.25)] hover:shadow-[0_8px_25px_rgba(2,132,199,0.35)] disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 animate-pulse" />
                    <span>Processing Secure Request...</span>
                  </div>
                ) : (
                  <>
                    {mode === 'LOGIN' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                    <span>{mode === 'LOGIN' ? 'Authenticate' : 'Create Staff Account'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-6 flex items-center gap-4 before:h-px before:flex-1 before:bg-slate-200 after:h-px after:flex-1 after:bg-slate-200">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">For Patients</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={async () => {
                const { createClient } = await import('@/lib/supabase/client');
                const supabase = createClient();
                await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback?role=PATIENT`
                  }
                });
              }}
              className="w-full py-4 mt-6 bg-white border-2 border-slate-200 hover:border-[#0284C7]/50 hover:bg-[#F0F9FF] text-slate-700 font-space font-bold tracking-wide rounded-2xl transition-all shadow-sm flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                <path d="M1 1h22v22H1z" fill="none"/>
              </svg>
              Sign in with Google
            </motion.button>

            {/* Toggle Mode Button */}
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-[#0284C7] hover:text-[#0369A1] text-sm font-bold transition-colors border-b-2 border-transparent hover:border-[#0284C7] pb-0.5"
              >
                {mode === 'LOGIN' ? "New Staff Member? Register Here" : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
