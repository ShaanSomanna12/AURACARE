'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, AlertCircle, ArrowRight, Activity, Building2, Stethoscope, Eye, EyeOff, User, ClipboardList, Phone, KeyRound, ShieldCheck, HeartPulse, Hospital, Sparkles, Pill, Heart, Cross, Syringe, TestTube, Microscope, Droplet } from 'lucide-react';
import Image from 'next/image';
import { loginUser, signUpUser } from './actions';

type AuthMode = 'LOGIN' | 'SIGNUP';
type Role = 'CUSTOMER_PHC' | 'DOCTOR_ADMIN' | 'PATIENT' | 'RECEPTIONIST';

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [role, setRole] = useState<Role>('CUSTOMER_PHC');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Random OTP generator state for Patient demo
  const [otpCode, setOtpCode] = useState('849201');
  const [otpNotice, setOtpNotice] = useState<string | null>(null);

  const handleGenerateRandomOtp = () => {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpCode(randomCode);
    setOtpNotice(`💬 SMS Simulated: Verification OTP Code is ${randomCode}`);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.append('role', role);

    startTransition(async () => {
      const res = mode === 'LOGIN' ? await loginUser(formData) : await signUpUser(formData);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F0F9FF] text-slate-800 flex flex-col justify-center items-center p-4 sm:p-6 relative font-sans overflow-hidden">
      
      {/* 1. Clinical Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(2,132,199,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(2,132,199,0.06)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      {/* 2. Ambient Medical Radial Light Orbs & Floating Medical Icons */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#0284C7]/20 via-[#38BDF8]/15 to-pink-500/10 blur-[140px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-gradient-to-br from-[#0EA5E9]/15 to-[#0284C7]/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Floating Medical Icons scattered around the background */}
      <motion.div className="absolute top-[15%] left-[10%] text-sky-400/30" animate={{ y: [-10, 10, -10], rotate: [0, 15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
        <Stethoscope className="w-16 h-16" />
      </motion.div>
      <motion.div className="absolute top-[25%] right-[15%] text-pink-400/20" animate={{ y: [10, -10, 10], rotate: [-10, 5, -10] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
        <Heart className="w-20 h-20" />
      </motion.div>
      <motion.div className="absolute bottom-[20%] left-[20%] text-emerald-400/30" animate={{ y: [-8, 8, -8], rotate: [0, -15, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
        <Pill className="w-12 h-12" />
      </motion.div>
      <motion.div className="absolute bottom-[30%] right-[10%] text-purple-400/20" animate={{ y: [8, -8, 8], rotate: [10, -5, 10] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
        <Syringe className="w-14 h-14" />
      </motion.div>
      <motion.div className="absolute top-[45%] left-[5%] text-indigo-400/20" animate={{ y: [-15, 15, -15] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}>
        <Microscope className="w-16 h-16" />
      </motion.div>
      <motion.div className="absolute top-[60%] right-[5%] text-red-400/20" animate={{ y: [15, -15, 15] }} transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}>
        <Droplet className="w-10 h-10" />
      </motion.div>
      <motion.div className="absolute bottom-[10%] left-[50%] text-blue-400/20 pointer-events-none -z-10" animate={{ y: [-5, 5, -5], rotate: [0, 20, 0] }} transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}>
        <Cross className="w-24 h-24" />
      </motion.div>

      {/* Additional Deep Medical Layer */}
      <motion.div className="absolute top-[8%] right-[35%] text-sky-400/20" animate={{ y: [6, -6, 6], scale: [1, 1.05, 1] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}>
        <Activity className="w-12 h-12" />
      </motion.div>
      <motion.div className="absolute bottom-[40%] left-[12%] text-emerald-400/15" animate={{ y: [-12, 12, -12], rotate: [-5, 5, -5] }} transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}>
        <ShieldCheck className="w-20 h-20" />
      </motion.div>
      <motion.div className="absolute top-[35%] right-[8%] text-rose-400/20" animate={{ y: [8, -8, 8], scale: [0.95, 1.05, 0.95] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}>
        <HeartPulse className="w-14 h-14" />
      </motion.div>
      <motion.div className="absolute bottom-[15%] right-[30%] text-cyan-400/20" animate={{ y: [-10, 10, -10], rotate: [15, -15, 15] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
        <TestTube className="w-12 h-12" />
      </motion.div>


      {/* 3. Stunning Animated ECG Monitor Trace */}
      <div className="absolute inset-x-0 bottom-0 h-48 pointer-events-none overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)] opacity-60">
        <svg 
          className="w-[200%] h-full text-[#0EA5E9]" 
          viewBox="0 0 2400 120" 
          preserveAspectRatio="none"
          style={{ filter: 'drop-shadow(0 0 15px rgba(14,165,233,0.9))' }}
        >
          <motion.path
            d="M0 60 L300 60 L310 50 L320 60 L330 60 L340 30 L350 100 L360 40 L370 70 L380 60 L400 60 L800 60 L810 50 L820 60 L830 60 L840 30 L850 100 L860 40 L870 70 L880 60 L900 60 L1300 60 L1310 50 L1320 60 L1330 60 L1340 30 L1350 100 L1360 40 L1370 70 L1380 60 L1400 60 L1800 60 L1810 50 L1820 60 L1830 60 L1840 30 L1850 100 L1860 40 L1870 70 L1880 60 L1900 60 L2400 60"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ x: [-1200, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      </div>

      {/* 4. Floating Hospital Vibe Badges */}
      <motion.div 
        className="absolute top-6 left-6 hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-sky-200 shadow-md backdrop-blur-md text-xs font-mono font-bold text-slate-700"
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <HeartPulse className="w-4 h-4 text-rose-500 animate-pulse" />
        <span>Emergency Triage Matrix Active</span>
      </motion.div>

      <motion.div 
        className="absolute top-6 right-6 hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-sky-200 shadow-md backdrop-blur-md text-xs font-mono font-bold text-slate-700"
        animate={{ y: [4, -4, 4] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Hospital className="w-4 h-4 text-[#0284C7]" />
        <span>Mandya Healthcare Network</span>
      </motion.div>

      {/* 5. Main Login Container */}
      <motion.div 
        className="w-full max-w-md relative z-10 space-y-6"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Brand Header */}
        <div className="text-center flex flex-col items-center">
          
          {/* Animated Circular Neon Logo Frame */}
          <motion.div 
            className="relative mb-3 group cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute -inset-2 bg-gradient-to-r from-pink-600 via-sky-500 to-emerald-400 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse" />
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#050811] border-2 border-pink-500/50 shadow-[0_0_35px_rgba(236,72,153,0.45)] flex items-center justify-center overflow-hidden">
              <Image 
                src="/logo.png" 
                alt="Tvarit Neon Logo" 
                width={150} 
                height={150} 
                priority 
                className="object-cover scale-135 transform transition-transform duration-300 group-hover:scale-145" 
              />
            </div>
          </motion.div>

          {/* TVARIT Header in Lucida Font */}
          <h1 className="font-['Lucida_Sans','Lucida_Grande','Lucida_Sans_Unicode',sans-serif] font-extrabold text-3xl sm:text-4xl text-slate-800 tracking-tight mt-1">
            TVARIT
          </h1>
          <p className="text-xs font-bold text-[#0284C7] uppercase tracking-wider mt-1 font-['Lucida_Sans','Lucida_Grande',sans-serif]">
            Instant Emergency Care & Hospital Referral System
          </p>
        </div>

        {/* Clinical Glassmorphism Card */}
        <motion.div 
          className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(2,132,199,0.18)] border border-sky-100/90 space-y-6 relative overflow-hidden"
          layout
        >
          {/* Subtle Top Accent Line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0284C7] via-pink-500 to-sky-400" />

          {/* Header Mode Title */}
          <div className="text-center">
            <h2 className="text-xl font-['Lucida_Sans','Lucida_Grande',sans-serif] font-extrabold text-slate-800 flex items-center justify-center gap-2">
              {role === 'PATIENT' ? (
                <>
                  <User className="w-5 h-5 text-[#0284C7]" />
                  <span>Patient Mobile Access</span>
                </>
              ) : (
                <>
                  <Stethoscope className="w-5 h-5 text-[#0284C7]" />
                  <span>Medical Staff Portal</span>
                </>
              )}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {role === 'PATIENT' ? 'Enter mobile phone number for instant OTP triage entry' : 'Select clinical role to authenticate into dashboard'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 overflow-hidden"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-700 font-semibold">{error}</span>
                </motion.div>
              )}
              {otpNotice && role === 'PATIENT' && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-emerald-800 text-xs font-bold font-mono text-center shadow-sm flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{otpNotice}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              className="space-y-4"
              initial={false}
              animate={{ opacity: 1 }}
            >
              {role === 'PATIENT' ? (
                /* PATIENT PHONE NUMBER + RANDOM OTP LOGIN FORM */
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-['Lucida_Sans',sans-serif]">
                      Patient Mobile Number (+91)
                    </label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#0284C7] transition-colors" />
                      <input
                        type="text"
                        name="phone"
                        required
                        className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-slate-400 outline-none focus:border-[#0284C7] focus:bg-white focus:ring-4 focus:ring-[#0284C7]/10 transition-all font-sans font-medium text-sm"
                        placeholder="Mobile Phone Number (+91)"
                        defaultValue="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-['Lucida_Sans',sans-serif]">
                      6-Digit Security OTP
                    </label>
                    <div className="relative group">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#0284C7] transition-colors" />
                      <input
                        type="text"
                        name="otp"
                        required
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value)}
                        maxLength={6}
                        className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl py-3.5 pl-12 pr-28 text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white focus:ring-4 focus:ring-[#0284C7]/10 transition-all font-mono font-bold tracking-widest text-center text-sm"
                        placeholder="6-Digit OTP"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateRandomOtp}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#0284C7] bg-sky-50 hover:bg-sky-100 px-2.5 py-1.5 rounded-xl border border-sky-200 transition-all font-mono shadow-sm active:scale-95"
                      >
                        Get New OTP
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* STAFF EMAIL + PASSWORD LOGIN FORM */
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-['Lucida_Sans',sans-serif]">
                      Medical Staff Email
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#0284C7] transition-colors" />
                      <input
                        key={`email-${role}-${mode}`}
                        type="email"
                        name="email"
                        required
                        className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-slate-400 outline-none focus:border-[#0284C7] focus:bg-white focus:ring-4 focus:ring-[#0284C7]/10 transition-all font-sans font-medium text-sm"
                        placeholder="Staff Email Address"
                        defaultValue={mode === 'LOGIN' ? (
                          role === 'CUSTOMER_PHC' ? 'worker@test.com' :
                          role === 'DOCTOR_ADMIN' ? 'doctor@test.com' :
                          'receptionist@test.com'
                        ) : ''}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-['Lucida_Sans',sans-serif]">
                      Access Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#0284C7] transition-colors" />
                      <input
                        key={`pass-${role}-${mode}`}
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        defaultValue="password123"
                        className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl py-4 pl-12 pr-12 text-slate-800 placeholder-slate-400 outline-none focus:border-[#0284C7] focus:bg-white focus:ring-4 focus:ring-[#0284C7]/10 transition-all font-sans font-medium text-sm"
                        placeholder="Staff Password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0284C7] transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ROLE SELECTOR (4 CLINICAL PORTALS) */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center font-['Lucida_Sans',sans-serif]">
                  Select Stakeholder Portal
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setRole('PATIENT')}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                      role === 'PATIENT' 
                        ? 'bg-[#F0F9FF] border-[#0284C7] text-[#0284C7] font-extrabold shadow-sm' 
                        : 'bg-white border-slate-100 hover:border-[#0284C7]/30 text-slate-400 hover:text-slate-500'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span className="text-[10px] font-bold text-center font-['Lucida_Sans',sans-serif]">Patient</span>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setRole('CUSTOMER_PHC')}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                      role === 'CUSTOMER_PHC' 
                        ? 'bg-[#F0F9FF] border-[#0284C7] text-[#0284C7] font-extrabold shadow-sm' 
                        : 'bg-white border-slate-100 hover:border-[#0284C7]/30 text-slate-400 hover:text-slate-500'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    <span className="text-[10px] font-bold text-center font-['Lucida_Sans',sans-serif]">PHC Worker</span>
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setRole('DOCTOR_ADMIN')}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                      role === 'DOCTOR_ADMIN' 
                        ? 'bg-[#F0F9FF] border-[#0284C7] text-[#0284C7] font-extrabold shadow-sm' 
                        : 'bg-white border-slate-100 hover:border-[#0284C7]/30 text-slate-400 hover:text-slate-500'
                    }`}
                  >
                    <Stethoscope className="w-5 h-5" />
                    <span className="text-[10px] font-bold text-center font-['Lucida_Sans',sans-serif]">Doctor</span>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setRole('RECEPTIONIST')}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                      role === 'RECEPTIONIST' 
                        ? 'bg-[#F0F9FF] border-[#0284C7] text-[#0284C7] font-extrabold shadow-sm' 
                        : 'bg-white border-slate-100 hover:border-[#0284C7]/30 text-slate-400 hover:text-slate-500'
                    }`}
                  >
                    <ClipboardList className="w-5 h-5" />
                    <span className="text-[10px] font-bold text-center font-['Lucida_Sans',sans-serif]">Receptionist</span>
                  </motion.button>
                </div>
              </div>

            </motion.div>

            <motion.button
              type="submit"
              disabled={isPending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white font-['Lucida_Sans',sans-serif] font-bold text-sm tracking-wide shadow-[0_10px_25px_-5px_rgba(2,132,199,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(2,132,199,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{role === 'PATIENT' ? 'Verify OTP & Enter Patient Portal' : 'Authenticate & Access Medical Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
