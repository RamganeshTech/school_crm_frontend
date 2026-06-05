import  { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// CORE FEATURES DATA (Strictly Non-AI, No Skeletons)
// ==========================================
const FEATURES_DATA = [
  { 
    id: "timetables",
    title: 'Smart Timetables', 
    shortTitle: 'Timetables',
    desc: 'Organize class schedules, assign teachers efficiently, and mathematically prevent period and room conflicts.', 
    icon: 'fa-calendar-days', 
    color: 'text-sky-500',
    bg: 'bg-sky-500',
    lightBg: 'bg-sky-50',
    glow: 'shadow-sky-500/20'
  },
  { 
    id: "attendance",
    title: 'Live Attendance', 
    shortTitle: 'Attendance',
    desc: 'Log daily attendance swiftly and keep parents informed with automated, instant mobile push alerts.', 
    icon: 'fa-user-check', 
    color: 'text-emerald-500',
    bg: 'bg-emerald-500',
    lightBg: 'bg-emerald-50',
    glow: 'shadow-emerald-500/20'
  },
  { 
    id: "assessments",
    title: 'Automated Assessments', 
    shortTitle: 'Assessments',
    desc: 'Distribute assignments, generate digital quizzes, and track class scoring metrics instantly.', 
    icon: 'fa-file-signature', 
    color: 'text-orange-500',
    bg: 'bg-orange-500',
    lightBg: 'bg-orange-50',
    glow: 'shadow-orange-500/20'
  },
  { 
    id: "finance",
    title: 'Finance & Ledger', 
    shortTitle: 'Finance',
    desc: 'Manage complex fee structures, record transactions, and maintain a complete, auditable digital ledger.', 
    icon: 'fa-wallet', 
    color: 'text-indigo-500',
    bg: 'bg-indigo-500',
    lightBg: 'bg-indigo-50',
    glow: 'shadow-indigo-500/20'
  },
  { 
    id: "reports",
    title: 'Dynamic Reports', 
    shortTitle: 'Reports',
    desc: 'Generate beautiful mark reports, term analyses, and deeply detailed student academic profiles.', 
    icon: 'fa-chart-pie', 
    color: 'text-green-500',
    bg: 'bg-green-500',
    lightBg: 'bg-green-50',
    glow: 'shadow-green-500/20'
  },
  { 
    id: "clubs",
    title: 'Clubs & Activities', 
    shortTitle: 'Activities',
    desc: 'Manage extracurriculars, track student participation, and organize vital out-of-classroom learning.', 
    icon: 'fa-masks-theater', 
    color: 'text-amber-500',
    bg: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    glow: 'shadow-amber-500/20'
  }
];

const FeaturesSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeFeature = FEATURES_DATA[activeIndex];

  // Abstract Art Renderers (Using pure CSS composition, no fake UI wireframes)
  const renderAbstractArt = (id: string) => {
    switch (id) {
      case 'timetables':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute w-48 h-48 bg-sky-200/50 rounded-full blur-2xl"></div>
            <div className="relative z-10 w-32 h-32 bg-white rounded-3xl shadow-xl flex items-center justify-center text-5xl text-sky-500 rotate-[-5deg]">
              <i className="fa-solid fa-calendar-days"></i>
            </div>
            <div className="absolute z-20 bottom-10 -right-4 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg font-bold text-xs rotate-[5deg]">
              Period 1 • Physics
            </div>
            <div className="absolute z-0 top-8 -left-4 bg-sky-100 text-sky-700 px-4 py-2 rounded-xl shadow-sm font-bold text-xs rotate-[-10deg]">
              Mon 09:00 AM
            </div>
          </div>
        );
      case 'attendance':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute w-48 h-48 bg-emerald-200/50 rounded-full blur-2xl"></div>
            <div className="relative z-10 w-32 h-32 bg-white rounded-full shadow-xl flex items-center justify-center text-5xl text-emerald-500">
              <i className="fa-solid fa-user-check"></i>
            </div>
            <div className="absolute z-20 bottom-8 -right-2 bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-lg font-bold text-xs">
              100% Present
            </div>
            <div className="absolute z-0 top-12 left-0 w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg font-bold text-[10px]">
              +32
            </div>
          </div>
        );
      case 'assessments':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute w-48 h-48 bg-orange-200/50 rounded-full blur-2xl"></div>
            <div className="relative z-10 w-32 h-40 bg-white rounded-2xl shadow-xl flex items-center justify-center text-5xl text-orange-500 rotate-[3deg]">
              <i className="fa-solid fa-file-signature"></i>
            </div>
            <div className="absolute z-20 top-10 -right-6 w-16 h-16 bg-slate-900 text-white rounded-full shadow-lg flex items-center justify-center font-bold text-lg rotate-[-10deg]">
              A+
            </div>
            <div className="absolute z-20 bottom-8 -left-4 bg-orange-100 text-orange-700 px-4 py-2 rounded-xl shadow-sm font-bold text-xs">
              Auto-Graded
            </div>
          </div>
        );
      case 'finance':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute w-48 h-48 bg-indigo-200/50 rounded-full blur-2xl"></div>
            <div className="relative z-10 w-40 h-28 bg-white rounded-2xl shadow-xl flex items-center justify-center text-6xl text-indigo-500">
              <i className="fa-solid fa-wallet"></i>
            </div>
            <div className="absolute z-20 -top-4 right-4 bg-emerald-500 text-white px-3 py-1.5 rounded-lg shadow-lg font-bold text-[10px] flex items-center gap-1.5">
              <i className="fa-solid fa-arrow-trend-up"></i> Collected
            </div>
            <div className="absolute z-0 bottom-6 -left-6 bg-indigo-900 text-indigo-50 px-4 py-2 rounded-xl shadow-lg font-bold text-xs">
              Fee Receipt Generated
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute w-48 h-48 bg-green-200/50 rounded-full blur-2xl"></div>
            <div className="relative z-10 w-36 h-36 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center text-6xl text-green-500 rotate-[-5deg]">
              <i className="fa-solid fa-chart-pie"></i>
            </div>
            <div className="absolute z-20 bottom-4 -right-4 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg font-bold text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Class Average
            </div>
          </div>
        );
      case 'clubs':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute w-48 h-48 bg-amber-200/50 rounded-full blur-2xl"></div>
            <div className="relative z-10 w-32 h-32 bg-white rounded-3xl shadow-xl flex items-center justify-center text-5xl text-amber-500">
              <i className="fa-solid fa-masks-theater"></i>
            </div>
            <div className="absolute z-20 top-4 -right-4 w-12 h-12 bg-slate-900 text-white rounded-full shadow-lg flex items-center justify-center text-lg rotate-[15deg]">
              <i className="fa-solid fa-basketball"></i>
            </div>
            <div className="absolute z-20 bottom-8 -left-6 w-12 h-12 bg-amber-100 text-amber-600 rounded-full shadow-lg flex items-center justify-center text-lg rotate-[-15deg]">
              <i className="fa-solid fa-palette"></i>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <section id="features" className="py-24 bg-white border-t border-slate-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6 md:mb-16 text-center max-w-2xl mx-auto">
          <h2 className="text-sm font-bold text-[var(--brand)] tracking-widest uppercase mb-3">Core Capabilities</h2>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Everything you need. Nothing you don't.
          </h3>
          <p className="text-base sm:text-lg text-slate-500 font-medium">
            A modular architecture designed to eliminate busywork and beautifully automate daily operations.
          </p>
        </div>

        {/* Feature Navigation Dock */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 max-w-4xl mx-auto">
          {FEATURES_DATA.map((feature, idx) => {
            const isActive = activeIndex === idx;
            return (
              <button
                key={feature.id}
                onClick={() => setActiveIndex(idx)}
                className={`relative cursor-pointer px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2
                  ${isActive 
                    ? `bg-slate-900 text-white shadow-lg` 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 border border-slate-200/60'
                  }`}
              >
                <i className={`fa-solid ${feature.icon} ${isActive ? 'text-white' : ''}`}></i>
                <span className="hidden sm:block">{feature.shortTitle}</span>
                <span className="block sm:hidden">{feature.shortTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Cinematic Spotlight Showcase Container */}
        <div className="relative w-full max-w-5xl mx-auto h-[450px] sm:h-[400px] bg-slate-50 rounded-[2rem] sm:rounded-[3rem] p-2 border border-slate-100 shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature.id}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full h-full rounded-[1.75rem] sm:rounded-[2.75rem] bg-white border border-slate-100 shadow-xl ${activeFeature.glow} flex flex-col sm:flex-row overflow-hidden`}
            >
              
              {/* Left Side: Deep Description */}
              <div className="w-full sm:w-1/2 p-8 sm:p-12 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-slate-100 relative z-10 bg-white">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm border border-white ${activeFeature.lightBg} ${activeFeature.color}`}>
                  <i className={`fa-solid ${activeFeature.icon}`}></i>
                </div>
                <h4 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 tracking-tight">
                  {activeFeature.title}
                </h4>
                <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
                  {activeFeature.desc}
                </p>
              </div>

              {/* Right Side: Abstract Art Canvas (No Fake UI) */}
              <div className="w-full sm:w-1/2 relative bg-slate-50 overflow-hidden flex items-center justify-center min-h-[200px]">
                {/* Decorative Grid Pattern */}
                <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                {renderAbstractArt(activeFeature.id)}
              </div>

            </motion.div>
          </AnimatePresence>

        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;