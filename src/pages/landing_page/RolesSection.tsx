

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// CENTRALIZED ROLES SCHEMA
// ==========================================
const ROLES_DATA = [
  {
    role: "correspondent",
    label: "Correspondent",
    icon: "fa-building-columns",
    color: "text-slate-700",
    bg: "bg-slate-700",
    lightBg: "bg-slate-50",
    borderColor: "border-slate-700",
    desc: "Institutional oversight, multi-branch analytics, and core financial governance.",
    features: ["Root Access", "Yield Analytics", "Trust Governance"]
  },
  {
    role: "principal",
    label: "Principal",
    icon: "fa-user-tie",
    color: "text-indigo-600",
    bg: "bg-indigo-600",
    lightBg: "bg-indigo-50",
    borderColor: "border-indigo-600",
    desc: "Bird's-eye view of academic performance, staff allocation, and daily scheduling.",
    features: ["Academic Tracking", "Staff Control", "Term Analytics"]
  },
  {
    role: "viceprincipal",
    label: "Vice Principal",
    icon: "fa-clipboard-user",
    color: "text-violet-600",
    bg: "bg-violet-600",
    lightBg: "bg-violet-50",
    borderColor: "border-violet-600",
    desc: "Ground-level daily operations, substitute assignments, and discipline tracking.",
    features: ["Daily Operations", "Substitutions", "Discipline Logs"]
  },
  {
    role: "administrator",
    label: "Administrator",
    icon: "fa-shield-halved",
    color: "text-sky-600",
    bg: "bg-sky-600",
    lightBg: "bg-sky-50",
    borderColor: "border-sky-600",
    desc: "System configuration, role access management, and cloud database security.",
    features: ["Access Config", "Audit Logs", "Cloud Security"]
  },
  {
    role: "accountant",
    label: "Accountant",
    icon: "fa-file-invoice-dollar",
    color: "text-emerald-600",
    bg: "bg-emerald-600",
    lightBg: "bg-emerald-50",
    borderColor: "border-emerald-600",
    desc: "Fee collection ledgers, automated invoice generation, and digital reconciliation.",
    features: ["Fee Collection", "Invoice Engine", "Payment Sync"]
  },
  {
    role: "teacher",
    label: "Teacher",
    icon: "fa-chalkboard-user",
    color: "text-amber-500",
    bg: "bg-amber-500",
    lightBg: "bg-amber-50",
    borderColor: "border-amber-500",
    desc: "Live attendance interfaces, smart mark reports, and homework assignment hubs.",
    features: ["Live Attendance", "Smart Grading", "Homework Hub"]
  },
  {
    role: "parent",
    label: "Parent",
    icon: "fa-hands-holding-child",
    color: "text-rose-500",
    bg: "bg-rose-500",
    lightBg: "bg-rose-50",
    borderColor: "border-rose-500",
    desc: "Real-time mobile notifications, academic progress views, and online fee gateways.",
    features: ["Push Alerts", "Progress View", "Fee Gateway"]
  },

];

const RolesSection = () => {
  const [rotationIndex, setRotationIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Dynamic angle calculation based on how many roles are actually active
  const totalRoles = ROLES_DATA.length;
  const angleStep = 360 / totalRoles;

  // Auto-ticking engine
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setRotationIndex((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const normalizedIndex = ((rotationIndex % totalRoles) + totalRoles) % totalRoles;
  const activeRole = ROLES_DATA[normalizedIndex];

  // Jump to a specific role when clicked
  const handlePetalClick = (index: number) => {
    setRotationIndex((prev) => prev + (index - normalizedIndex));
  };

  return (
    <section id="roles" className="py-12 sm:py-24 bg-slate-50 relative overflow-hidden flex flex-col items-center">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40 pointer-events-none">
        <div className="w-[800px] h-[800px] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px]" style={{ WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 60%)' }}></div>
      </div>

      <div className="relative z-10 text-center mb-10 px-6">
        <h2 className="text-sm font-bold text-[var(--brand)] tracking-widest uppercase mb-3">The Ecosystem</h2>
        <h3 className="text-3xl sm:text-4xl font-bold text-slate-900">Tailored for every role.</h3>
        <p className="text-slate-500 mt-4 max-w-xl mx-auto font-medium">
          A granular platform where every user experiences a unique, perfectly tailored digital campus.
        </p>
      </div>

      {/* Responsive Scaling Wrapper */}
      <div 
        className="relative w-full flex justify-center items-center h-[400px] sm:h-[550px] lg:h-[750px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-[750px] h-[750px] scale-[0.4] sm:scale-[0.7] lg:scale-100 transition-transform duration-500 origin-center flex items-center justify-center">
          
          {/* Orbital Rings */}
          <div className="absolute w-[600px] h-[600px] rounded-full border border-slate-200"></div>
          <div className="absolute w-[600px] h-[600px] rounded-full border border-dashed border-slate-300 animate-[spin_60s_linear_infinite]"></div>
          <div className="absolute w-[400px] h-[400px] rounded-full border border-slate-100 bg-white/40 backdrop-blur-sm"></div>

          {/* THE PETALS (Surrounding Cards) */}
          {ROLES_DATA.map((item, index) => {
            const isActive = index === normalizedIndex;
            
            // 🌟 DYNAMIC MATH FIX 🌟
            // Uses angleStep instead of hardcoded 45 to perfectly calculate the radius gap
            const wrapperAngle = (index - rotationIndex) * angleStep;
            
            // Counter-rotate the inner element so icons and text remain upright
            const counterAngle = -wrapperAngle;

            return (
              <motion.div
                key={item.role}
                className="absolute top-1/2 left-1/2 w-24 h-24 -ml-12 -mt-12 z-20 cursor-pointer group"
                animate={{ rotate: wrapperAngle }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
                onClick={() => handlePetalClick(index)}
              >
                <motion.div
                  className="w-full h-full flex flex-col items-center justify-center relative"
                  style={{ y: -300 }} // y: -300 puts 0 degrees exactly at 12 o'clock (the top)
                  animate={{ rotate: counterAngle, scale: isActive ? 1.15 : 0.9 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Active Aura Glow */}
                  {isActive && (
                    <div className={`absolute inset-0 rounded-full blur-xl opacity-40 ${item.bg}`}></div>
                  )}
                  
                  {/* Petal Card */}
                  <div className={`relative w-20 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg border-2 transition-colors duration-300 ${isActive ? `bg-white ${item.borderColor}` : 'bg-slate-50 border-slate-200 group-hover:border-slate-300'}`}>
                    <i className={`fa-solid ${item.icon} text-2xl ${isActive ? item.color : 'text-slate-400 group-hover:text-slate-500'}`}></i>
                  </div>
                  
                  {/* Petal Label */}
                  <div className={`absolute -bottom-6 w-32 text-center text-lg font-bold transition-colors ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    {item.label}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}

          {/* THE CENTER BUD (Description Display) */}
          <div className="absolute z-30 w-[340px] h-[340px] rounded-full bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col items-center justify-center p-8 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRole.role}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex flex-col items-center text-center w-full"
              >
                {/* Dynamic Icon Header */}
                <div className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-2xl shadow-inner border ${activeRole.lightBg} ${activeRole.color} ${activeRole.borderColor}`}>
                  <i className={`fa-solid ${activeRole.icon}`}></i>
                </div>
                
                {/* Dynamic Text */}
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{activeRole.label} Portal</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
                  {activeRole.desc}
                </p>

                {/* 🌟 USER REQUESTED BLOCK: Kept Exactly as is 🌟 */}
                <div className="w-full flex flex-col gap-2">
                  {activeRole.features.map((feature, idx) => (
                    <div key={idx} className="flex mx-auto items-center gap-3 px-4 py-2 rounded-xl">
                      {/* <div className={`w-2 h-2 rounded-full ${activeRole.bg}`}></div> */}
                      <span className="text-md font-bold text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};

export default RolesSection;