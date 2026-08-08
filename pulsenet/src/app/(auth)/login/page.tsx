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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FFF5F2] relative overflow-hidden font-sans">
      
      {/* 🌸 PEACH & WHITE ANIMATED BACKGROUND 🌸 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#FFE4D6_0%,_transparent_50%),_radial-gradient(circle_at_bottom_left,_#FFFFFF_0%,_transparent_50%)]" />
        
        {/* Soft Floating Orbs */}
        <motion.div 
          animate={{ y: [0, -30, 0], x: [0, 20, 0] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[5%] left-[10%] w-96 h-96 bg-[#FFD1BA] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 z-0" 
        />
        <motion.div 
          animate={{ y: [0, 40, 0], x: [0, -20, 0] }} 
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] right-[10%] w-[30rem] h-[30rem] bg-[#FFE8E0] rounded-full mix-blend-multiply filter blur-[120px] opacity-60 z-0" 
        />
        <motion.div 
          animate={{ y: [0, -20, 0], x: [0, -40, 0] }} 
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] right-[20%] w-80 h-80 bg-[#FFFFFF] rounded-full mix-blend-overlay filter blur-[80px] opacity-80 z-0" 
        />
        
        {/* Very subtle medical plus pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,140,105,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,140,105,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* 🏥 LOGIN/SIGNUP CARD 🏥 */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(255,140,105,0.15)] border border-white relative overflow-hidden">
          
          {/* Subtle peach accent line at the top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FFB89E] via-[#FF8C69] to-[#FFB89E]" />

          {/* Optional: Dark Header block to make the neon logo pop without clashing with the white page */}
          <div className="w-full bg-[#0B0F19] pt-10 pb-8 flex flex-col items-center relative overflow-hidden rounded-t-[2rem]">
            {/* Dark background glow for logo */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(6,182,212,0.15)_0%,_transparent_70%)]" />
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
              className="relative w-full flex justify-center z-10"
            >
              <div className="relative w-32 h-32 flex items-center justify-center">
                <Image 
                  src="/logo.png" 
                  alt="Tvarit Logo" 
                  fill
                  className="object-contain drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]"
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
              <h1 className="text-2xl font-space font-bold text-slate-800 tracking-wide mb-1">
                {mode === 'LOGIN' ? 'Welcome to Tvarit' : 'Join the Network'}
              </h1>
              <p className="text-slate-500 text-sm">
                {mode === 'LOGIN' ? 'Sign in to access your medical dashboard' : 'Register as a healthcare operator'}
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
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span className="text-sm text-red-700 font-medium">{error}</span>
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
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#FF8C69] transition-colors" />
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-slate-400 outline-none focus:border-[#FF8C69] focus:bg-white focus:ring-4 focus:ring-[#FF8C69]/10 transition-all font-sans"
                    placeholder="Email Address"
                    defaultValue={mode === 'LOGIN' ? 'worker@test.com' : ''}
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#FF8C69] transition-colors" />
                  <input
                    type="password"
                    name="password"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-slate-400 outline-none focus:border-[#FF8C69] focus:bg-white focus:ring-4 focus:ring-[#FF8C69]/10 transition-all font-sans"
                    placeholder="Password"
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
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">Select Your Role</label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setRole('CUSTOMER_PHC')}
                          className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                            role === 'CUSTOMER_PHC' 
                              ? 'bg-[#FF8C69]/10 border-[#FF8C69] text-[#FF8C69]' 
                              : 'bg-white border-slate-200 hover:border-[#FF8C69]/50 text-slate-500'
                          }`}
                        >
                          <Building2 className="w-6 h-6" />
                          <span className="text-xs font-bold">PHC Worker</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setRole('DOCTOR_ADMIN')}
                          className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                            role === 'DOCTOR_ADMIN' 
                              ? 'bg-[#FF8C69]/10 border-[#FF8C69] text-[#FF8C69]' 
                              : 'bg-white border-slate-200 hover:border-[#FF8C69]/50 text-slate-500'
                          }`}
                        >
                          <Stethoscope className="w-6 h-6" />
                          <span className="text-xs font-bold">Hospital Doctor</span>
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
                className="w-full py-4 mt-4 bg-[#FF8C69] hover:bg-[#FF7F50] text-white font-space font-bold tracking-wide rounded-xl transition-all shadow-[0_8px_20px_rgba(255,140,105,0.3)] hover:shadow-[0_8px_25px_rgba(255,140,105,0.4)] disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 animate-pulse" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    {mode === 'LOGIN' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                    <span>{mode === 'LOGIN' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Toggle Mode Button */}
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors border-b border-transparent hover:border-slate-800 pb-0.5"
              >
                {mode === 'LOGIN' ? "New to Tvarit? Create an account" : "Already registered? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
