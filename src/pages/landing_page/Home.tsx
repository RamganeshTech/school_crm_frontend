// import  { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Button } from '../../shared/ui/Button'; 
// import { useAuthData } from '../../hooks/useAuthData'; // Make sure this path is correct

// const Home = () => {
//   const navigate = useNavigate();
//   const { userId , currentRole} = useAuthData();
//   const [scrolled, setScrolled] = useState(false);

//   // Handle subtle navbar background on scroll
//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 20);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   // Intelligent routing based on authentication and role
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
//     <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-500/30">
      
//       {/* --- NAVIGATION BAR --- */}
//       <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm py-3' : 'bg-transparent py-5'}`}>
//         <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
//           <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
//             <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
//               <i className="fa-solid fa-graduation-cap text-xl text-white"></i>
//             </div>
//             <span className="text-xl font-bold tracking-tight text-slate-900">BMB LMS</span>
//           </div>
          
//           <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
//             <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
//             <a href="#solutions" className="hover:text-blue-600 transition-colors">Solutions</a>
//             <a href="#about" className="hover:text-blue-600 transition-colors">About Us</a>
//           </div>

//           <div className="flex items-center gap-4">
//             {!userId && (
//               <button onClick={() => navigate('/login')} className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors hidden sm:block">
//                 Log in
//               </button>
//             )}
//             <Button onClick={handleGetStarted} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 border-none">
//               {userId ? 'Go to Dashboard' : 'Get Started'}
//             </Button>
//           </div>
//         </div>
//       </nav>

//       {/* --- HERO SECTION --- */}
//       <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
//         {/* Soft Colorful Background Shapes */}
//         <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-3xl pointer-events-none"></div>
//         <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-indigo-100/50 rounded-full blur-3xl pointer-events-none"></div>
        
//         <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-16">
          
//           {/* Left: Text Content */}
//           <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
//             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold tracking-wide uppercase mb-6 border border-blue-100">
//               <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
//               The Complete Educational Ecosystem
//             </div>
            
//             <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 leading-[1.15] tracking-tight mb-6">
//               Empower Learning. <br/>
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Simplify Management.</span>
//             </h1>
            
//             <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
//               BMB Learning Management System connects administrators, teachers, parents, and students in one seamless, highly-organized digital campus.
//             </p>
            
//             <div className="flex flex-wrap items-center gap-4">
//               <Button onClick={() => navigate('/login')} size="lg" className="px-8 bg-blue-600 hover:bg-blue-700 text-white text-base shadow-lg shadow-blue-500/25 border-none">
//                 Start Exploring
//               </Button>
//             </div>
//           </div>

//           {/* Right: Abstract UI Representation */}
//           <div className="w-full lg:w-1/2 relative perspective-1000 hidden md:block">
//             <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden transform rotate-y-[-5deg] rotate-x-[5deg] transition-transform duration-700 hover:rotate-0">
//               {/* Browser Header */}
//               <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
//                 <div className="w-3 h-3 rounded-full bg-red-400"></div>
//                 <div className="w-3 h-3 rounded-full bg-amber-400"></div>
//                 <div className="w-3 h-3 rounded-full bg-green-400"></div>
//               </div>
              
//               {/* Mockup Content */}
//               <div className="p-6 flex flex-col gap-6 bg-slate-50 h-[400px]">
//                 <div className="flex justify-between items-center">
//                   <div className="w-1/3 h-6 bg-white rounded-md border border-slate-200"></div>
//                   <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500"><i className="fa-solid fa-user"></i></div>
//                 </div>
                
//                 <div className="grid grid-cols-3 gap-4">
//                   {[
//                     { c: 'bg-blue-100', t: 'text-blue-600' }, 
//                     { c: 'bg-green-100', t: 'text-green-600' }, 
//                     { c: 'bg-purple-100', t: 'text-purple-600' }
//                   ].map((color, i) => (
//                     <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
//                       <div className={`w-8 h-8 rounded-lg ${color.c} ${color.t} flex items-center justify-center text-sm`}><i className="fa-solid fa-chart-simple"></i></div>
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
//                   <div className="w-2/3 h-full bg-blue-50 rounded-lg border border-blue-100 flex items-end p-2 gap-2">
//                      {[40, 70, 45, 90, 65, 80].map((h, i) => (
//                         <div key={i} className="w-full bg-blue-400 rounded-t-sm" style={{ height: `${h}%` }}></div>
//                      ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             {/* Floating decorative elements */}
//             <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce-slow">
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
//       <section id="features" className="py-24 bg-slate-50">
//         <div className="max-w-7xl mx-auto px-6 lg:px-8">
//           <div className="text-center max-w-2xl mx-auto mb-16">
//             <h2 className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-3">Core Capabilities</h2>
//             <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to run your school.</h3>
//             <p className="text-slate-600 text-lg">A unified platform eliminating the need for scattered spreadsheets and disjointed communication tools.</p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {[
//               { title: 'Timetable Scheduling', desc: 'Organize class schedules, assign teachers efficiently, and prevent period conflicts.', icon: 'fa-calendar-days', color: 'text-indigo-600', bg: 'bg-indigo-100' },
//               { title: 'Real-time Attendance', desc: 'Log daily attendance swiftly and keep parents informed with automated status updates.', icon: 'fa-user-check', color: 'text-emerald-600', bg: 'bg-emerald-100' },
//               { title: 'Role-Based Access', desc: 'Secure data management ensuring admins, teachers, and parents only see what they need to.', icon: 'fa-shield-halved', color: 'text-blue-600', bg: 'bg-blue-100' },
//               { title: 'School Finance & Ledger', desc: 'Manage fee structures, record transactions, and maintain a complete, auditable ledger.', icon: 'fa-wallet', color: 'text-teal-600', bg: 'bg-teal-100' },
//               { title: 'Comprehensive Reports', desc: 'Generate dynamic mark reports, term analyses, and detailed student academic profiles.', icon: 'fa-chart-pie', color: 'text-purple-600', bg: 'bg-purple-100' },
//               { title: 'Homework Module', desc: 'Assign tasks, collect submissions, and provide targeted feedback all in one place.', icon: 'fa-book-open', color: 'text-sky-600', bg: 'bg-sky-100' },
//               { title: 'Extracurricular Activities', desc: 'Manage clubs, track student participation, and organize out-of-classroom learning.', icon: 'fa-masks-theater', color: 'text-orange-500', bg: 'bg-orange-100' },
//             ].map((feature, idx) => (
//               <div key={idx} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
//                 <div className={`w-12 h-12 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center text-xl mb-5`}>
//                   <i className={`fa-solid ${feature.icon}`}></i>
//                 </div>
//                 <h4 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h4>
//                 <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* --- CTA SECTION --- */}
//       <section className="py-20 relative overflow-hidden bg-white border-t border-slate-200">
//         <div className="max-w-4xl mx-auto px-6 relative z-10 text-center bg-gradient-to-br from-slate-900 to-slate-800 p-12 md:p-16 rounded-3xl shadow-xl">
//           <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to transform your campus?</h2>
//           <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto">
//             Upgrade your administrative workflow and focus on what truly matters: student success.
//           </p>
//           <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
//             <Button onClick={handleGetStarted} size="lg" className="px-10 py-3 text-base w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white border-none shadow-lg">
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
//               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
//                 <i className="fa-solid fa-graduation-cap text-sm text-white"></i>
//               </div>
//               <span className="text-lg font-bold tracking-tight text-slate-900">BMB LMS</span>
//             </div>
//             <div className="flex items-center gap-6 text-slate-500">
//               <a href="#" className="hover:text-blue-600 transition-colors"><i className="fa-brands fa-twitter text-xl"></i></a>
//               <a href="#" className="hover:text-blue-600 transition-colors"><i className="fa-brands fa-linkedin text-xl"></i></a>
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



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui/Button'; 
import { useAuthData } from '../../hooks/useAuthData';

// ==========================================
// CENTRALIZED HEX THEME CONTROLLER
// Change these hex codes to anything you want!
// ==========================================
const THEME = {
  brand: "#0ea5e9",       // Main color (Buttons, Icons, Highlights) - Default: Light Blue
  brandHover: "#0284c7",  // Darker shade for hover states
  brandSoft: "#e0f2fe",   // Very light shade for subtle backgrounds
  brandText: "#0369a1",   // Darker shade for readable text on soft backgrounds
};

const Home = () => {
  const navigate = useNavigate();
  // Using your exact auth logic
  const { userId, currentRole } = useAuthData(); 
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intelligent routing based on userId and currentRole
  const handleGetStarted = () => {
    if (!userId) {
      navigate('/login');
    } else if (currentRole === 'parent') {
      navigate('/dashboard/profile-selection');
    } else {
      navigate('/dashboard'); 
    }
  };

  return (
    <div 
      // Injecting our hex codes as CSS variables so Tailwind can use them dynamically
      style={{
        '--brand': THEME.brand,
        '--brand-hover': THEME.brandHover,
        '--brand-soft': THEME.brandSoft,
        '--brand-text': THEME.brandText,
      } as React.CSSProperties}
      className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-[var(--brand-soft)]"
    >
      
      {/* --- NAVIGATION BAR --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-[var(--brand)] rounded-xl flex items-center justify-center shadow-md">
              <i className="fa-solid fa-graduation-cap text-xl text-white"></i>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">BMB LMS</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-[var(--brand)] transition-colors">Features</a>
            <a href="#solutions" className="hover:text-[var(--brand)] transition-colors">Solutions</a>
            <a href="#about" className="hover:text-[var(--brand)] transition-colors">About Us</a>
          </div>

          <div className="flex items-center gap-4">
            {!userId && (
              <button onClick={() => navigate('/login')} className="text-sm font-semibold text-slate-700 hover:text-[var(--brand)] transition-colors hidden sm:block">
                Log in
              </button>
            )}
            <Button onClick={handleGetStarted} className="bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white shadow-md border-none">
              {userId ? 'Go to Dashboard' : 'Get Started'}
            </Button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
        {/* Soft Background Orbs mapped to Hex Theme */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-[var(--brand-soft)] opacity-60 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-[var(--brand-soft)] opacity-40 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left: Text Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--brand-soft)] text-[var(--brand-text)] text-xs font-semibold tracking-wide uppercase mb-6 border border-[var(--brand-soft)]">
              <span className="w-2 h-2 rounded-full bg-[var(--brand)] animate-pulse"></span>
              The Complete Educational Ecosystem
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-[1.2] tracking-tight mb-6">
              Empower Learning. <br/>
              <span className="text-[var(--brand)]">Simplify Management.</span>
            </h1>
            
            <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
              BMB Learning Management System connects administrators, teachers, parents, and students in one seamless, highly-organized digital campus.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <Button onClick={() => navigate('/login')} size="lg" className="px-8 bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white text-base shadow-lg border-none">
                Start Exploring
              </Button>
            </div>
          </div>

          {/* Right: Abstract UI Representation */}
          <div className="w-full lg:w-1/2 relative perspective-1000 hidden md:block">
            <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden transform rotate-y-[-5deg] rotate-x-[5deg] transition-transform duration-700 hover:rotate-0">
              <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              
              <div className="p-6 flex flex-col gap-6 bg-slate-50 h-[400px]">
                <div className="flex justify-between items-center">
                  <div className="w-1/3 h-6 bg-white rounded-md border border-slate-200"></div>
                  <div className="w-10 h-10 rounded-full bg-[var(--brand-soft)] flex items-center justify-center text-[var(--brand)]"><i className="fa-solid fa-user"></i></div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center text-sm"><i className="fa-solid fa-chart-simple"></i></div>
                      <div className="w-1/2 h-3 bg-slate-200 rounded"></div>
                      <div className="w-3/4 h-5 bg-slate-300 rounded"></div>
                    </div>
                  ))}
                </div>

                <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex gap-4">
                  <div className="w-1/3 space-y-3">
                     <div className="w-full h-4 bg-slate-100 rounded"></div>
                     <div className="w-5/6 h-4 bg-slate-100 rounded"></div>
                     <div className="w-full h-4 bg-slate-100 rounded"></div>
                  </div>
                  <div className="w-2/3 h-full bg-[var(--brand-soft)] rounded-lg border border-transparent flex items-end p-2 gap-2 opacity-80">
                     {[40, 70, 45, 90, 65, 80].map((h, i) => (
                        <div key={i} className="w-full bg-[var(--brand)] opacity-70 rounded-t-sm" style={{ height: `${h}%` }}></div>
                     ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating decorative elements */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-4 animate-bounce-slow">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-lg">
                <i className="fa-solid fa-check"></i>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Attendance Synced</p>
                <p className="text-xs text-slate-500">Just now</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CORE FEATURES SECTION --- */}
      <section id="features" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-[var(--brand)] tracking-widest uppercase mb-3">Core Capabilities</h2>
            <h3 className="text-3xl font-semibold text-slate-900 mb-4">Everything you need to run your school.</h3>
            <p className="text-slate-600 text-lg">A unified platform eliminating the need for scattered spreadsheets and disjointed communication tools.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Timetable Scheduling', desc: 'Organize class schedules, assign teachers efficiently, and prevent period conflicts.', icon: 'fa-calendar-days' },
              { title: 'Real-time Attendance', desc: 'Log daily attendance swiftly and keep parents informed with automated status updates.', icon: 'fa-user-check' },
              { title: 'Role-Based Access', desc: 'Secure data management ensuring admins, teachers, and parents only see what they need to.', icon: 'fa-shield-halved' },
              { title: 'School Finance & Ledger', desc: 'Manage fee structures, record transactions, and maintain a complete, auditable ledger.', icon: 'fa-wallet' },
              { title: 'Comprehensive Reports', desc: 'Generate dynamic mark reports, term analyses, and detailed student academic profiles.', icon: 'fa-chart-pie' },
              { title: 'Homework Module', desc: 'Assign tasks, collect submissions, and provide targeted feedback all in one place.', icon: 'fa-book-open' },
              { title: 'Extracurricular Activities', desc: 'Manage clubs, track student participation, and organize out-of-classroom learning.', icon: 'fa-masks-theater' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-[var(--brand-soft)] transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center text-xl mb-5">
                  <i className={`fa-solid ${feature.icon}`}></i>
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 relative overflow-hidden bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center bg-slate-900 p-12 md:p-16 rounded-3xl shadow-xl">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">Ready to transform your campus?</h2>
          <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto">
            Upgrade your administrative workflow and focus on what truly matters: student success.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button onClick={handleGetStarted} size="lg" className="px-10 py-3 text-base w-full sm:w-auto bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white border-none shadow-lg">
              {userId ? 'Go to Dashboard' : 'Get Started Now'}
            </Button>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[var(--brand)] rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-graduation-cap text-sm text-white"></i>
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">BMB LMS</span>
            </div>
            <div className="flex items-center gap-6 text-slate-500">
              <a href="#" className="hover:text-[var(--brand)] transition-colors"><i className="fa-brands fa-twitter text-xl"></i></a>
              <a href="#" className="hover:text-[var(--brand)] transition-colors"><i className="fa-brands fa-linkedin text-xl"></i></a>
            </div>
          </div>
          
          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} BMB Learning Management System. All rights reserved.</p>
            <div className="flex items-center gap-1">
              <span>Built for modern education.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;