// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Button } from '../../shared/ui/Button'; 
// import { useAuthData } from '../../hooks/useAuthData';

// // ==========================================
// // CENTRALIZED HEX THEME CONTROLLER
// // Change these hex codes to anything you want!
// // ==========================================
// const THEME = {
//   brand: "#0ea5e9",       // Main color (Buttons, Icons, Highlights) - Default: Light Blue
//   brandHover: "#0284c7",  // Darker shade for hover states
//   brandSoft: "#e0f2fe",   // Very light shade for subtle backgrounds
//   brandText: "#0369a1",   // Darker shade for readable text on soft backgrounds
// };

// const Home = () => {
//   const navigate = useNavigate();
//   // Using your exact auth logic
//   const { userId, currentRole } = useAuthData(); 
//   const [scrolled, setScrolled] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 20);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   // Intelligent routing based on userId and currentRole
//   const handleGetStarted = () => {
//     if (!userId) {
//       navigate('/login');
//     } else if (currentRole === 'parent') {
//       navigate('/dashboard/profile-selection');
//     } else {
//       navigate('/dashboard'); 
//     }
//   };

//   return (
//     <div 
//       // Injecting our hex codes as CSS variables so Tailwind can use them dynamically
//       style={{
//         '--brand': THEME.brand,
//         '--brand-hover': THEME.brandHover,
//         '--brand-soft': THEME.brandSoft,
//         '--brand-text': THEME.brandText,
//       } as React.CSSProperties}
//       className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-[var(--brand-soft)]"
//     >

//       {/* --- NAVIGATION BAR --- */}
//       <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm py-3' : 'bg-transparent py-5'}`}>
//         <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
//           <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
//             <div className="w-10 h-10 bg-[var(--brand)] rounded-xl flex items-center justify-center shadow-md">
//               <i className="fa-solid fa-graduation-cap text-xl text-white"></i>
//             </div>
//             <span className="text-xl font-bold tracking-tight text-slate-900">BMB LMS</span>
//           </div>

//           <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
//             <a href="#features" className="hover:text-[var(--brand)] transition-colors">Features</a>
//             <a href="#solutions" className="hover:text-[var(--brand)] transition-colors">Solutions</a>
//             <a href="#about" className="hover:text-[var(--brand)] transition-colors">About Us</a>
//           </div>

//           <div className="flex items-center gap-4">
//             {!userId && (
//               <button onClick={() => navigate('/login')} className="text-sm font-semibold text-slate-700 hover:text-[var(--brand)] transition-colors hidden sm:block">
//                 Log in
//               </button>
//             )}
//             <Button onClick={handleGetStarted} className="bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white shadow-md border-none">
//               {userId ? 'Go to Dashboard' : 'Get Started'}
//             </Button>
//           </div>
//         </div>
//       </nav>

//       {/* --- HERO SECTION --- */}
//       <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
//         {/* Soft Background Orbs mapped to Hex Theme */}
//         <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-[var(--brand-soft)] opacity-60 rounded-full blur-3xl pointer-events-none"></div>
//         <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-[var(--brand-soft)] opacity-40 rounded-full blur-3xl pointer-events-none"></div>

//         <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-16">

//           {/* Left: Text Content */}
//           <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
//             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--brand-soft)] text-[var(--brand-text)] text-xs font-semibold tracking-wide uppercase mb-6 border border-[var(--brand-soft)]">
//               <span className="w-2 h-2 rounded-full bg-[var(--brand)] animate-pulse"></span>
//               The Complete Educational Ecosystem
//             </div>

//             <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-[1.2] tracking-tight mb-6">
//               Empower Learning. <br/>
//               <span className="text-[var(--brand)]">Simplify Management.</span>
//             </h1>

//             <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
//               BMB Learning Management System connects administrators, teachers, parents, and students in one seamless, highly-organized digital campus.
//             </p>

//             <div className="flex flex-wrap items-center gap-4">
//               <Button onClick={() => navigate('/login')} size="lg" className="px-8 bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white text-base shadow-lg border-none">
//                 Start Exploring
//               </Button>
//             </div>
//           </div>

//           {/* Right: Abstract UI Representation */}
//           <div className="w-full lg:w-1/2 relative perspective-1000 hidden md:block">
//             <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden transform rotate-y-[-5deg] rotate-x-[5deg] transition-transform duration-700 hover:rotate-0">
//               <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
//                 <div className="w-3 h-3 rounded-full bg-red-400"></div>
//                 <div className="w-3 h-3 rounded-full bg-amber-400"></div>
//                 <div className="w-3 h-3 rounded-full bg-green-400"></div>
//               </div>

//               <div className="p-6 flex flex-col gap-6 bg-slate-50 h-[400px]">
//                 <div className="flex justify-between items-center">
//                   <div className="w-1/3 h-6 bg-white rounded-md border border-slate-200"></div>
//                   <div className="w-10 h-10 rounded-full bg-[var(--brand-soft)] flex items-center justify-center text-[var(--brand)]"><i className="fa-solid fa-user"></i></div>
//                 </div>

//                 <div className="grid grid-cols-3 gap-4">
//                   {[1, 2, 3].map((i) => (
//                     <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
//                       <div className="w-8 h-8 rounded-lg bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center text-sm"><i className="fa-solid fa-chart-simple"></i></div>
//                       <div className="w-1/2 h-3 bg-slate-200 rounded"></div>
//                       <div className="w-3/4 h-5 bg-slate-300 rounded"></div>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex gap-4">
//                   <div className="w-1/3 space-y-3">
//                      <div className="w-full h-4 bg-slate-100 rounded"></div>
//                      <div className="w-5/6 h-4 bg-slate-100 rounded"></div>
//                      <div className="w-full h-4 bg-slate-100 rounded"></div>
//                   </div>
//                   <div className="w-2/3 h-full bg-[var(--brand-soft)] rounded-lg border border-transparent flex items-end p-2 gap-2 opacity-80">
//                      {[40, 70, 45, 90, 65, 80].map((h, i) => (
//                         <div key={i} className="w-full bg-[var(--brand)] opacity-70 rounded-t-sm" style={{ height: `${h}%` }}></div>
//                      ))}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Floating decorative elements */}
//             <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-4 animate-bounce-slow">
//               <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-lg">
//                 <i className="fa-solid fa-check"></i>
//               </div>
//               <div>
//                 <p className="text-sm font-semibold text-slate-800">Attendance Synced</p>
//                 <p className="text-xs text-slate-500">Just now</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* --- CORE FEATURES SECTION --- */}
//       <section id="features" className="py-24 bg-slate-50 border-t border-slate-200">
//         <div className="max-w-7xl mx-auto px-6 lg:px-8">
//           <div className="text-center max-w-2xl mx-auto mb-16">
//             <h2 className="text-sm font-bold text-[var(--brand)] tracking-widest uppercase mb-3">Core Capabilities</h2>
//             <h3 className="text-3xl font-semibold text-slate-900 mb-4">Everything you need to run your school.</h3>
//             <p className="text-slate-600 text-lg">A unified platform eliminating the need for scattered spreadsheets and disjointed communication tools.</p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {[
//               { title: 'Timetable Scheduling', desc: 'Organize class schedules, assign teachers efficiently, and prevent period conflicts.', icon: 'fa-calendar-days' },
//               { title: 'Real-time Attendance', desc: 'Log daily attendance swiftly and keep parents informed with automated status updates.', icon: 'fa-user-check' },
//               { title: 'Role-Based Access', desc: 'Secure data management ensuring admins, teachers, and parents only see what they need to.', icon: 'fa-shield-halved' },
//               { title: 'School Finance & Ledger', desc: 'Manage fee structures, record transactions, and maintain a complete, auditable ledger.', icon: 'fa-wallet' },
//               { title: 'Comprehensive Reports', desc: 'Generate dynamic mark reports, term analyses, and detailed student academic profiles.', icon: 'fa-chart-pie' },
//               { title: 'Homework Module', desc: 'Assign tasks, collect submissions, and provide targeted feedback all in one place.', icon: 'fa-book-open' },
//               { title: 'Extracurricular Activities', desc: 'Manage clubs, track student participation, and organize out-of-classroom learning.', icon: 'fa-masks-theater' },
//             ].map((feature, idx) => (
//               <div key={idx} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-[var(--brand-soft)] transition-all group">
//                 <div className="w-12 h-12 rounded-xl bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center text-xl mb-5">
//                   <i className={`fa-solid ${feature.icon}`}></i>
//                 </div>
//                 <h4 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h4>
//                 <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* --- CTA SECTION --- */}
//       <section className="py-20 relative overflow-hidden bg-white border-t border-slate-200">
//         <div className="max-w-4xl mx-auto px-6 relative z-10 text-center bg-slate-900 p-12 md:p-16 rounded-3xl shadow-xl">
//           <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">Ready to transform your campus?</h2>
//           <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto">
//             Upgrade your administrative workflow and focus on what truly matters: student success.
//           </p>
//           <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
//             <Button onClick={handleGetStarted} size="lg" className="px-10 py-3 text-base w-full sm:w-auto bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white border-none shadow-lg">
//               {userId ? 'Go to Dashboard' : 'Get Started Now'}
//             </Button>
//           </div>
//         </div>
//       </section>

//       {/* --- FOOTER --- */}
//       <footer className="bg-slate-50 border-t border-slate-200 pt-12 pb-8">
//         <div className="max-w-7xl mx-auto px-6 lg:px-8">
//           <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 bg-[var(--brand)] rounded-lg flex items-center justify-center">
//                 <i className="fa-solid fa-graduation-cap text-sm text-white"></i>
//               </div>
//               <span className="text-lg font-bold tracking-tight text-slate-900">BMB LMS</span>
//             </div>
//             <div className="flex items-center gap-6 text-slate-500">
//               <a href="#" className="hover:text-[var(--brand)] transition-colors"><i className="fa-brands fa-twitter text-xl"></i></a>
//               <a href="#" className="hover:text-[var(--brand)] transition-colors"><i className="fa-brands fa-linkedin text-xl"></i></a>
//             </div>
//           </div>

//           <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
//             <p>&copy; {new Date().getFullYear()} BMB Learning Management System. All rights reserved.</p>
//             <div className="flex items-center gap-1">
//               <span>Built for modern education.</span>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default Home;

// const THEME = {
//   brand: "#0d9488",       // Teal 500
//   brandHover: "#0f766e",  // Teal 600
//   brandSoft: "#f0fdfa",   // Teal 50
//   brandText: "#134e4a",   // Teal 900
//   accent: "#f59e0b",      // Amber 500
//   accentSoft: "#fffbeb",  // Amber 50
//   surface: "#ffffff",
//   background: "#f8fafc",  // Slate 50
// };


// SECOND VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Button } from '../../shared/ui/Button';
import { useAuthData } from '../../hooks/useAuthData';
import RolesSection from './RolesSection';
import FeaturesSection from './FeaturesSection';

// ==========================================
// PREMIUM SAAS THEME: OCEAN & CORAL
// ==========================================
const THEME = {
  brand: "#0284c7",       // Ocean Blue (Primary)
  brandHover: "#0369a1",  // Darker Blue
  brandSoft: "#f0f9ff",   // Very Light Blue
  brandText: "#075985",   // Deep Blue Text
  accent: "#f97316",      // Vibrant Coral/Orange (Accent)
  accentSoft: "#fff7ed",  // Light Coral
};

// Properly Typed Variants for Framer Motion
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const Home = () => {
  const navigate = useNavigate();
  const { userId, currentRole } = useAuthData();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    if (!userId) {
      navigate('/login');
    } else if (currentRole === 'parent') {
      navigate('/dashboard/profile-selection');
    }
    else if (currentRole === "teacher") {
      navigate(`dashboard/attendance-report`)
    }
    else {
      navigate('/dashboard');
    }
  };

  return (
    <div
      style={{
        '--brand': THEME.brand,
        '--brand-hover': THEME.brandHover,
        '--brand-soft': THEME.brandSoft,
        '--accent': THEME.accent,
      } as React.CSSProperties}
      className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-[var(--brand-soft)] overflow-x-hidden"
    >

      {/* --- NAVIGATION --- */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/50 shadow-sm py-4' : 'bg-transparent py-6'}`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-[var(--brand)] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <i className="fa-solid fa-graduation-cap text-xl text-white"></i>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              BuildMySchool
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#ecosystem" className="hover:text-[var(--brand)] transition-colors">Ecosystem</a>
            <a href="#features" className="hover:text-[var(--brand)] transition-colors">Features</a>
            <a href="#roles" className="hover:text-[var(--brand)] transition-colors">For Roles</a>
          </div>

          <div className="flex items-center gap-4">
            {!userId && (
              <button onClick={() => navigate('/login')} className="text-sm font-bold text-slate-600 hover:text-[var(--brand)] transition-colors hidden sm:block">
                Sign In
              </button>
            )}
            <Button onClick={handleGetStarted} className="bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white shadow-lg shadow-sky-500/30 border-none rounded-lg px-6 py-2 transition-all">
              {userId ? 'Dashboard' : 'Get Started'}
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-16 pb-16 lg:pt-16 overflow-hidden bg-white border-b border-slate-100">

        {/* Soft Background Glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-100 rounded-full blur-[120px] pointer-events-none opacity-60 translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-50 rounded-full blur-[100px] pointer-events-none opacity-60 -translate-x-1/4 translate-y-1/4"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left: Text Content */}
          <motion.div
            initial="hidden" animate="visible" variants={staggerContainer}
            className="w-full lg:w-1/2 flex flex-col items-start text-left z-20"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--brand-soft)] text-[var(--brand)] text-xs font-bold tracking-wider uppercase border border-sky-100 mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></span>
              The Complete Learning OS
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-slate-900 leading-[1.15] tracking-tight mb-6">
              Empower Learning. <br />
              <span className="text-[var(--brand)]">Simplify Operations.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed font-medium">
              BuildMySchool connects educators, students, accountants, and leadership into one beautifully organized, lightning-fast digital campus.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button onClick={handleGetStarted} size="lg" className="w-full sm:w-auto px-8 py-4 bg-[var(--accent)] text-white text-base shadow-xl shadow-orange-500/20 border-none rounded-xl font-bold transition-transform hover:-translate-y-1">
                {userId ? 'Enter Dashboard' : 'Start Your Journey'}
                <i className="fa-solid fa-arrow-right ml-2"></i>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right: Premium Cascading Smart Panels (Features Focused) */}
          <div className="w-full lg:w-1/2 relative h-[500px] lg:h-[600px] hidden md:flex items-center justify-center">

            {/* Ambient Tech Background: Soft Glows + Radial Dot Grid */}
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-60">
              <div className="absolute w-[400px] h-[400px] bg-sky-200/50 rounded-full blur-[80px]"></div>
              <div className="absolute w-[300px] h-[300px] bg-orange-100/40 rounded-full blur-[80px] translate-x-20 translate-y-20"></div>
              {/* Elegant dot grid fading out at the edges */}
              <div
                className="w-full h-full bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-70"
                style={{ WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)' }}
              ></div>
            </div>

            {/* Container for the staggered feature cards */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
              }}
              className="relative z-10 w-full max-w-lg flex flex-col gap-5"
            >

              {/* Feature Panel 1: Attendance System (Shifted Left) */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -30, y: 15 },
                  visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
                }}
                className="self-start w-[85%] bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] border border-slate-200/60 relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>

                <div className="flex justify-between items-start mb-5 pl-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Attendance System</h3>
                    <p className="text-xs text-slate-500 font-bold mt-0.5">Automated Daily Tracking</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                    <i className="fa-solid fa-user-check text-lg"></i>
                  </div>
                </div>

                {/* Visual Representation of a week's attendance */}
                <div className="pl-2 flex items-center justify-between gap-2">
                  {['M', 'T', 'W', 'T', 'F'].map((day, i) => (
                    <div key={day} className="flex-1 flex flex-col items-center gap-2 bg-slate-50 py-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{day}</span>
                      {/* Using a dot to represent a clean UI rather than numbers */}
                      <div className={`w-2.5 h-2.5 rounded-full ${i === 4 ? 'bg-slate-300' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`}></div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Feature Panel 2: Mark Report (Dark Mode - Shifted Right) */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: 30, y: 15 },
                  visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
                }}
                className="self-end w-[90%] bg-slate-900 p-5 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] border border-slate-800 relative z-20 -mt-2"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center shadow-inner text-sky-400 text-xl border border-sky-400/20">
                    <i className="fa-solid fa-chart-pie"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white">Mark Reports</h3>
                    <p className="text-xs text-slate-400 font-bold mt-0.5">Comprehensive Term Analytics</p>
                  </div>
                </div>

                {/* Abstract UI representation of grade bars */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">Q1</div>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full w-[85%] bg-sky-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">Q2</div>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full w-[92%] bg-emerald-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Feature Panel 3: Clubs & Activities (Centered, overlapping bottom) */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
                }}
                className="self-center w-[85%] bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] border border-slate-200/80 flex items-center gap-4 -mt-4 z-30"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--accentSoft)] flex items-center justify-center text-[var(--accent)] text-lg shadow-sm border border-orange-100 shrink-0">
                  <i className="fa-solid fa-masks-theater"></i>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Extracurriculars</p>
                  <p className="text-sm font-bold text-slate-800">Clubs & Activities</p>
                </div>

                {/* Visual representation of different club types */}
                <div className="flex -space-x-2 mr-2">
                  <div className="w-8 h-8 rounded-full bg-rose-50 border-2 border-white flex items-center justify-center text-rose-500 text-[10px] shadow-sm"><i className="fa-solid fa-palette"></i></div>
                  <div className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center text-indigo-500 text-[10px] shadow-sm"><i className="fa-solid fa-flask"></i></div>
                  <div className="w-8 h-8 rounded-full bg-amber-50 border-2 border-white flex items-center justify-center text-amber-500 text-[10px] shadow-sm"><i className="fa-solid fa-basketball"></i></div>
                </div>
              </motion.div>

            </motion.div>
          </div>


        </div>
      </section>

      {/* --- ALL ROLES SECTION --- */}
      {/* <section id="roles" className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-sm font-bold text-[var(--brand)] tracking-widest uppercase mb-3">One Unified Platform</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-slate-900">Dedicated portals for every single role.</h3>
            <p className="text-slate-500 mt-4 max-w-2xl mx-auto">Access levels and dashboards are perfectly tailored so your staff only sees what they need to manage.</p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {[
              { role: 'Correspondent', desc: 'Trust & Ownership', icon: 'fa-building-columns', color: 'text-slate-700 bg-slate-200' },
              { role: 'Principal', desc: 'Academic Leadership', icon: 'fa-user-tie', color: 'text-indigo-600 bg-indigo-100' },
              { role: 'Vice Principal', desc: 'Daily Operations', icon: 'fa-clipboard-user', color: 'text-violet-600 bg-violet-100' },
              { role: 'Administrator', desc: 'System Management', icon: 'fa-shield-halved', color: 'text-sky-600 bg-sky-100' },
              { role: 'Accountant', desc: 'Financial Ledgers', icon: 'fa-file-invoice-dollar', color: 'text-emerald-600 bg-emerald-100' },
              { role: 'Teacher', desc: 'Classroom Control', icon: 'fa-chalkboard-user', color: 'text-amber-600 bg-amber-100' },
              { role: 'Parent', desc: 'Student Tracking', icon: 'fa-hands-holding-child', color: 'text-rose-600 bg-rose-100' },
              { role: 'Student', desc: 'Active Learning', icon: 'fa-user-graduate', color: 'text-orange-600 bg-orange-100' },
            ].map((item, idx) => (
              <motion.div key={idx} variants={fadeUp} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center text-xl mb-4`}>
                  <i className={`fa-solid ${item.icon}`}></i>
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">{item.role}</h4>
                <p className="text-slate-500 text-xs">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section> */}

      {/* --- ALL ROLES SECTION (Premium Bento Grid with Interactive Reveals) --- */}
      {/* <section id="roles" className="py-24 bg-slate-50 relative overflow-hidden">
        
       
        <div className="absolute inset-0 z-0 pointer-events-none flex justify-center">
          <div className="w-full h-full bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:32px_32px] opacity-30" style={{ WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          
         
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-sm font-bold text-[var(--brand)] tracking-widest uppercase mb-3">One Unified Platform</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-slate-900">Dedicated portals for every single role.</h3>
            <p className="text-slate-500 mt-4 max-w-2xl mx-auto font-medium">
              Access levels and dashboards are perfectly tailored. Your staff, students, and parents only see exactly what they need to succeed.
            </p>
          </motion.div>

         
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {[
              { 
                role: 'Correspondent', desc: 'Trust & Campus Ownership', icon: 'fa-building-columns', 
                badge: 'Root Access', span: 'sm:col-span-2 lg:col-span-2', 
                colorClass: 'group-hover:border-slate-800 group-hover:bg-slate-50', iconColor: 'text-slate-700', badgeColor: 'bg-slate-800 text-white' 
              },
              { 
                role: 'Principal', desc: 'Academic Leadership', icon: 'fa-user-tie', 
                badge: 'Analytics Hub', span: 'sm:col-span-1 lg:col-span-1', 
                colorClass: 'group-hover:border-indigo-500 group-hover:bg-indigo-50/50', iconColor: 'text-indigo-600', badgeColor: 'bg-indigo-500 text-white' 
              },
              { 
                role: 'Vice Principal', desc: 'Daily Operations', icon: 'fa-clipboard-user', 
                badge: 'Staff Control', span: 'sm:col-span-1 lg:col-span-1', 
                colorClass: 'group-hover:border-violet-500 group-hover:bg-violet-50/50', iconColor: 'text-violet-600', badgeColor: 'bg-violet-500 text-white' 
              },
              { 
                role: 'Administrator', desc: 'System Management', icon: 'fa-shield-halved', 
                badge: 'Full Config', span: 'sm:col-span-1 lg:col-span-1', 
                colorClass: 'group-hover:border-sky-500 group-hover:bg-sky-50/50', iconColor: 'text-sky-600', badgeColor: 'bg-sky-500 text-white' 
              },
              { 
                role: 'Accountant', desc: 'Financial Ledgers', icon: 'fa-file-invoice-dollar', 
                badge: 'Fee Tracking', span: 'sm:col-span-1 lg:col-span-1', 
                colorClass: 'group-hover:border-emerald-500 group-hover:bg-emerald-50/50', iconColor: 'text-emerald-600', badgeColor: 'bg-emerald-500 text-white' 
              },
              { 
                role: 'Teacher', desc: 'Classroom Control', icon: 'fa-chalkboard-user', 
                badge: 'Smart Grading', span: 'sm:col-span-2 lg:col-span-2', 
                colorClass: 'group-hover:border-amber-500 group-hover:bg-amber-50/50', iconColor: 'text-amber-500', badgeColor: 'bg-amber-500 text-white' 
              },
              { 
                role: 'Parent', desc: 'Student Tracking', icon: 'fa-hands-holding-child', 
                badge: 'Live Alerts', span: 'sm:col-span-2 lg:col-span-2', 
                colorClass: 'group-hover:border-rose-500 group-hover:bg-rose-50/50', iconColor: 'text-rose-500', badgeColor: 'bg-rose-500 text-white' 
              },
              { 
                role: 'Student', desc: 'Active Learning', icon: 'fa-user-graduate', 
                badge: 'Assignments', span: 'sm:col-span-2 lg:col-span-2', 
                colorClass: 'group-hover:border-orange-500 group-hover:bg-orange-50/50', iconColor: 'text-orange-500', badgeColor: 'bg-orange-500 text-white' 
              },
            ].map((item, idx) => (
              <motion.div 
                key={idx} 
                variants={fadeUp} 
                className={`group relative bg-white p-6 rounded-2xl border-2 border-transparent shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 cursor-default overflow-hidden flex flex-col justify-between min-h-[160px] ${item.span} ${item.colorClass}`}
              >
               
                <div className="absolute inset-0 border-2 border-slate-100 rounded-2xl group-hover:opacity-0 transition-opacity duration-300 pointer-events-none"></div>

                <div className="relative z-10 flex justify-between items-start">
                  <div className={`w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl text-slate-400 group-hover:scale-110 group-hover:bg-white group-hover:shadow-sm group-hover:${item.iconColor} transition-all duration-300`}>
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  
                 
                  <div className={`opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm ${item.badgeColor}`}>
                    {item.badge}
                  </div>
                </div>
                
                <div className="relative z-10 mt-6 transition-transform duration-300 group-hover:translate-x-1">
                  <h4 className="text-lg font-bold text-slate-900 mb-1">{item.role}</h4>
                  <p className="text-slate-500 text-sm font-medium">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
        </div>
      </section> */}

      <RolesSection />

      {/* FEATURE GRID */}
      {/* <section id="features" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="mb-16 md:w-2/3"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">Core Capabilities</h2>
            <p className="text-lg text-slate-500">A modular architecture designed to eliminate busywork and automate daily operations across your entire campus.</p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { title: 'Smart Timetables', desc: 'Organize class schedules, assign teachers efficiently, and auto-prevent period conflicts.', icon: 'fa-calendar-days', iconColor: 'text-sky-500' },
              { title: 'Live Attendance', desc: 'Log daily attendance swiftly and keep parents informed with automated mobile push alerts.', icon: 'fa-user-check', iconColor: 'text-emerald-500' },
              { title: 'AI-Powered Quizzes', desc: 'Generate assessments instantly from PDFs using advanced Gemini 2.0 AI integration.', icon: 'fa-wand-magic-sparkles', iconColor: 'text-orange-500' },
              { title: 'Finance & Ledger', desc: 'Manage fee structures, record transactions, and maintain a complete, auditable ledger.', icon: 'fa-wallet', iconColor: 'text-indigo-500' },
              { title: 'Dynamic Reports', desc: 'Generate beautiful mark reports, term analyses, and detailed student academic profiles.', icon: 'fa-chart-pie', iconColor: 'text-rose-500' },
              { title: 'Clubs & Activities', desc: 'Manage extracurriculars, track student participation, and organize out-of-classroom learning.', icon: 'fa-masks-theater', iconColor: 'text-amber-500' },
            ].map((feature, idx) => (
              <motion.div key={idx} variants={fadeUp} className="flex gap-4 group">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl group-hover:bg-white group-hover:shadow-md transition-all">
                  <i className={`fa-solid ${feature.icon} ${feature.iconColor}`}></i>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section> */}

      <FeaturesSection />

      {/* --- HIGH CONTRAST CTA --- */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="bg-[var(--brand)] rounded-[2rem] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden"
          >
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400 rounded-full blur-[80px] opacity-30 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--accent)] rounded-full blur-[80px] opacity-20 -translate-x-1/2 translate-y-1/2"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to upgrade your school?</h2>
              <p className="text-sky-100 text-lg max-w-2xl mx-auto mb-10">
                Join modern educational institutions simplifying their workflows with BuildMySchool today.
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button onClick={handleGetStarted} size="lg" className="w-full sm:w-auto bg-[var(--accent)] hover:bg-orange-600 text-white font-bold text-base px-10 py-4 rounded-xl border-none shadow-xl transition-transform hover:scale-105">
                  {userId ? 'Go to Dashboard' : 'Get Started Now'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- CLEAN FOOTER --- */}
      <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-graduation-cap text-sm text-white"></i>
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">BuildMySchool</span>
            </div>
            <div className="flex items-center gap-6 text-slate-400">
              <a href="#" className="hover:text-[var(--brand)] transition-colors"><i className="fa-brands fa-twitter text-xl"></i></a>
              <a href="#" className="hover:text-[var(--brand)] transition-colors"><i className="fa-brands fa-linkedin text-xl"></i></a>
              <a href="#" className="hover:text-[var(--brand)] transition-colors"><i className="fa-brands fa-instagram text-xl"></i></a>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} BuildMySchool LMS. All rights reserved.</p>
            <div className="flex items-center gap-2 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;