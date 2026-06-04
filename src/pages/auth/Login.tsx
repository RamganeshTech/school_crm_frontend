import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginUser } from '../../api_services/auth_api/authApi';
// import { setToken } from '../../lib/tokenManager';
import { setCredentials } from '../../features/slices/authSlice';
// import { useToast } from '../../shared/ui/ToastContext';
import { Input } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';
import { toast } from '../../shared/ui/ToastContext';
import { COMPANY } from '../../constants/constants';

// ==========================================
// CENTRALIZED HEX THEME CONTROLLER (LOGIN PAGE)
// Change these hex codes to anything you want!
// For a Pale Green theme, you could use:
// brand: "#059669" (Emerald 600)
// ==========================================
// const THEME = {
//   brand: "#0ea5e9",       // Main color (Left panel background, buttons, links)
//   brandHover: "#0284c7",  // Darker shade for hover states
//   brandSoft: "#e0f2fe",   // Very light shade for subtle backgrounds/glows
//   brandText: "#0369a1",   // Darker text for readability
// };

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Validation State
  const [errors, setErrors] = useState({ identifier: '', password: '' });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useLoginUser();

  // const { showToast } = useToast();

  // ⭐ VALIDATION LOGIC ⭐
  const validateForm = () => {
    let isValid = true;
    const newErrors = { identifier: '', password: '' };

    if (!identifier.trim()) {
      newErrors.identifier = 'Email or phone number is required';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Block API call if validation fails
    if (!validateForm()) return;

    try {
      const response = await mutateAsync({ identifier, password });

      if (response.ok) {
        // setToken(response.token);

        const schoolIdString = typeof response.user.schoolId === 'object'
          ? response.user.schoolId?._id
          : response.user.schoolId;

        dispatch(setCredentials({
          _id: response.user._id,
          userName: response.user.userName,
          schoolId: schoolIdString || '',
          role: response.user.role,
          academicYear: response?.user?.academicYear || null,
          token: "",
          studentId: response?.user?.studentId || [],
          assignments: response?.user?.assignments || [],
          isPlatformAdmin: response?.user?.isPlatformAdmin || false,
          schoolName: response.user.schoolName || null
        }));
        // showToast(`Welcome back, ${response.user.userName}!`, 'success');
        toast.success(`Welcome back, ${response.user.userName}!`)


        // 3. SECURE ROUTING LOGIC: Check role and navigate accordingly
        if (response.user.role?.toLowerCase() === 'parent') {
          navigate('/dashboard/profile-selection');
        } else {
          navigate('/dashboard');
        }

        // navigate('/dashboard');
      }
    } catch (error: any) {
      // Show backend errors (like "Invalid credentials") directly on the password field
      setErrors({ ...errors, password: error.message || 'Invalid credentials' });
    }
  };

  // return (


  //   <div className="w-full h-full flex bg-background font-sans overflow-y-auto">

  //     {/* LEFT SIDE: Learning Graphic / Branding (Hidden on Mobile) */}
  //     <div className="hidden lg:flex lg:w-1/2 bg-primary-soft relative flex-col items-center justify-center p-12 overflow-hidden border-r border-border">
  //       {/* Background decorative elements */}
  //       <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl"></div>
  //       <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary opacity-20 rounded-full blur-3xl"></div>

  //       <div className="relative z-10 w-full max-w-lg text-center">
  //         <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-8">
  //           <i className="fa-solid fa-graduation-cap text-4xl text-inverse"></i>
  //         </div>
  //         <h1 className="text-4xl font-bold text-foreground mb-4">Empower Your Learning Journey</h1>
  //         <p className="text-lg text-muted leading-relaxed">
  //           Access world-class courses, track your progress, and collaborate with peers in a distraction-free environment.
  //         </p>

  //         <div className="mt-12 w-full h-64 bg-surface rounded-2xl shadow-xl border border-border p-6 flex flex-col gap-4 transform rotate-1 hover:rotate-0 transition-transform duration-500">
  //           <div className="w-full h-8 bg-background rounded border border-border"></div>
  //           <div className="flex gap-4 h-full">
  //             <div className="w-1/3 h-full bg-primary-soft rounded border border-border flex items-center justify-center">
  //               <i className="fa-solid fa-chart-line text-primary opacity-50 text-2xl"></i>
  //             </div>
  //             <div className="w-2/3 flex flex-col gap-4">
  //               <div className="w-full h-1/2 bg-background rounded border border-border"></div>
  //               <div className="w-full h-1/2 bg-background rounded border border-border"></div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>

  //     {/* RIGHT SIDE: Login Form */}
  //     <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
  //       <div className="w-full max-w-md bg-surface p-8 sm:p-10 rounded-2xl shadow-lg border border-border">

  //         {/* Mobile Logo */}
  //         <div className="lg:hidden w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-sm mb-6">
  //           <i className="fa-solid fa-graduation-cap text-xl text-inverse"></i>
  //         </div>

  //         <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Welcome back</h2>
  //         <p className="text-sm text-muted mb-8">Please enter your details to sign in.</p>

  //         <form onSubmit={handleLogin} className="space-y-5 p-6">

  //           {/* ⭐ CUSTOM INPUT: Identifier ⭐ */}
  //           <Input
  //             label="Email or Phone Number"
  //             id="identifier"
  //             type="text"
  //             placeholder="Enter your email or phone"
  //             leftIcon="fa-regular fa-user"
  //             value={identifier}
  //             onChange={(e) => {
  //               setIdentifier(e.target.value);
  //               // Clear error immediately when user starts typing
  //               if (errors.identifier) setErrors({ ...errors, identifier: '' });
  //             }}
  //             error={errors.identifier}
  //             required
  //           />

  //           {/* ⭐ CUSTOM INPUT: Password ⭐ */}
  //           <div className="relative">
  //             <Input
  //               label="Password"
  //               id="password"
  //               type={showPassword ? 'text' : 'password'}
  //               placeholder="••••••••"
  //               leftIcon="fa-solid fa-lock"
  //               value={password}
  //               onChange={(e) => {
  //                 setPassword(e.target.value);
  //                 // Clear error immediately when user starts typing
  //                 if (errors.password) setErrors({ ...errors, password: '' });
  //               }}
  //               error={errors.password}
  //               required
  //             />

  //             {/* Clickable Show/Hide Toggle Overlay */}
  //             <button
  //               type="button"
  //               onClick={() => setShowPassword(!showPassword)}
  //               // Positioned 34px from top to align perfectly with the input box (ignoring the label/error text)
  //               className="absolute right-3 top-[34px] flex items-center text-muted hover:text-primary transition-colors cursor-pointer"
  //               tabIndex={-1}
  //             >
  //               <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
  //             </button>
  //           </div>

  //           {/* Remember Me / Forgot Password */}
  //           <div className="flex items-center justify-between mt-2">
  //             <div className="flex items-center gap-2">
  //               <input
  //                 type="checkbox"
  //                 id="remember"
  //                 className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-background cursor-pointer"
  //               />
  //               <label htmlFor="remember" className="text-sm text-muted select-none cursor-pointer">
  //                 Remember me
  //               </label>
  //             </div>
  //             <a href="#" className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors">
  //               Forgot password?
  //             </a>
  //           </div>

  //           {/* ⭐ CUSTOM BUTTON: Submit ⭐ */}
  //           <Button
  //             type="submit"
  //             variant="primary"
  //             size="lg"
  //             fullWidth
  //             isLoading={isPending} // Automatically handles the spinner and disabled state!
  //             rightIcon={!isPending ? "fa-solid fa-arrow-right" : undefined}
  //             className="mt-6"
  //           >
  //             Sign in
  //           </Button>

  //         </form>

  //       </div>
  //     </div>
  //   </div>
  // );



  // SECOND VERSION
  //   return (
  //     <div className="min-h-screen w-full flex bg-surface">
  //       {/* LEFT SIDE: Professional Branding & LMS Illustration */}
  //       <div className="hidden lg:flex w-1/2 bg-primary relative items-center justify-center p-12 overflow-hidden">
  //         {/* Subtle geometric pattern using primary-soft */}
  //         <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--color-primary-soft)_1px,_transparent_1px)] bg-[length:40px_40px]"></div>

  //         <div className="relative z-10 text-inverse max-w-md">
  //           <div className="mb-8">
  //             <i className="fa-solid fa-graduation-cap text-6xl text-inverse/90"></i>
  //           </div>
  //           <h1 className="text-4xl font-extrabold mb-6 tracking-tight">Smart Learning Management</h1>
  //           <p className="text-inverse/80 text-lg leading-relaxed mb-8">
  //             The all-in-one ecosystem for educators and students. Manage your academic growth with precision and clarity.
  //           </p>

  //           {/* Abstract Dashboard preview card */}
  //           {/* <div className="bg-surface/10 backdrop-blur-md border border-inverse/20 rounded-2xl p-6 shadow-2xl">
  //             <div className="flex items-center gap-4 mb-4">
  //               <div className="w-12 h-12 rounded-full bg-inverse/20 flex items-center justify-center">
  //                 <i className="fa-solid fa-chart-pie text-inverse"></i>
  //               </div>
  //               <div className="space-y-1">
  //                 <div className="w-32 h-3 bg-inverse/40 rounded"></div>
  //                 <div className="w-20 h-2 bg-inverse/20 rounded"></div>
  //               </div>
  //             </div>
  //             <div className="space-y-3">
  //               <div className="h-2 w-full bg-inverse/20 rounded"></div>
  //               <div className="h-2 w-3/4 bg-inverse/20 rounded"></div>
  //             </div>
  //           </div> */}

  //           {/* Professional LMS Student Progress Card */}
  // <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl space-y-6">
  //   {/* Student Header */}
  //   <div className="flex items-center gap-4">
  //     <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/30">
  //       <i className="fa-solid fa-user-graduate text-2xl"></i>
  //     </div>
  //     <div>
  //       <div className="w-24 h-4 bg-white/40 rounded mb-2"></div>
  //       <div className="w-16 h-2 bg-white/20 rounded"></div>
  //     </div>
  //   </div>

  //   {/* Academic Performance Rows */}
  //   <div className="space-y-4">
  //     {[
  //       { name: 'Mathematics', percent: '85%' },
  //       { name: 'Physics', percent: '72%' },
  //       { name: 'English', percent: '90%' }
  //     ].map((subject, i) => (
  //       <div key={i}>
  //         <div className="flex justify-between text-[10px] text-white/70 mb-1 font-medium uppercase tracking-wider">
  //           <span>{subject.name}</span>
  //           <span>{subject.percent}</span>
  //         </div>
  //         <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
  //           <div className="h-full bg-white/80 rounded-full" style={{ width: subject.percent }}></div>
  //         </div>
  //       </div>
  //     ))}
  //   </div>

  //   {/* Status Footer */}
  //   <div className="flex items-center gap-2 bg-black/20 p-3 rounded-lg border border-white/10">
  //     <i className="fa-solid fa-circle-check text-emerald-400 text-sm"></i>
  //     <span className="text-[11px] font-medium text-white/90">All assignments submitted</span>
  //   </div>
  // </div>
  //         </div>
  //       </div>

  //       {/* RIGHT SIDE: Clean Login Form */}
  //       <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
  //         <div className="w-full max-w-sm space-y-8">
  //           <div className="space-y-2">
  //             <h2 className="text-3xl font-bold text-foreground">Sign In</h2>
  //             <p className="text-muted">Enter your credentials to access your dashboard.</p>
  //           </div>

  //           <form onSubmit={handleLogin} className="space-y-6">
  //             <Input
  //               label="Email or Phone"
  //               placeholder="name@institution.edu"
  //               value={identifier}
  //               onChange={(e) => setIdentifier(e.target.value)}
  //               error={errors.identifier}
  //             />

  //             <div className="relative">
  //               <Input
  //                 label="Password"
  //                 type={showPassword ? 'text' : 'password'}
  //                 placeholder="••••••••"
  //                 value={password}
  //                 onChange={(e) => setPassword(e.target.value)}
  //                 error={errors.password}
  //               />
  //               <button
  //                 type="button"
  //                 onClick={() => setShowPassword(!showPassword)}
  //                 className="absolute right-3 top-9 text-muted hover:text-primary transition-colors"
  //               >
  //                 <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
  //               </button>
  //             </div>

  //             <Button type="submit" size="lg" fullWidth isLoading={isPending} className="bg-primary hover:bg-primary-hover transition-all">
  //               Sign In
  //             </Button>

  //             <div className="text-center text-sm text-muted">
  //               Need help? <a href="#" className="font-semibold text-primary underline underline-offset-4">Contact Support</a>
  //             </div>
  //           </form>
  //         </div>
  //       </div>
  //     </div>
  //   )

  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans overflow-y-auto selection:bg-teal-100">

      {/* LEFT SIDE: Deep Teal Branding & LMS Illustration */}
      <div className="hidden md:flex w-1/2 bg-teal-800 relative items-center justify-center p-12 overflow-hidden">

        {/* Crisp, structural background pattern instead of blurry orbs */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

        {/* Subtle lighting overlay */}
        <div className="absolute top-[-20%] right-[-10%] w-3/4 h-3/4 bg-teal-600 opacity-20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 text-white max-w-md">
          <div className="mb-8 flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <i className="fa-solid fa-graduation-cap text-3xl text-white drop-shadow-md"></i>
            </div>
            <span className="text-2xl font-bold tracking-tight">{COMPANY.name} LMS</span>
          </div>
          <h1 className="text-4xl font-bold mb-5 tracking-tight leading-tight text-white/95">
            Smart Learning Management
          </h1>
          <p className="text-teal-50 text-lg leading-relaxed mb-10 opacity-90">
            The all-in-one ecosystem for educators and students. Manage your academic growth with precision and clarity.
          </p>

          {/* Professional LMS Student Progress Card */}
          <div className="bg-teal-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
            {/* Student Header */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-inner">
                <i className="fa-solid fa-user-graduate text-xl"></i>
              </div>
              <div>
                <div className="w-28 h-3.5 bg-white/40 rounded mb-2"></div>
                <div className="w-16 h-2 bg-white/20 rounded"></div>
              </div>
            </div>

            {/* Academic Performance Rows */}
            <div className="space-y-5">
              {[
                { name: 'Mathematics', percent: '85%' },
                { name: 'Physics', percent: '72%' },
                { name: 'English', percent: '90%' }
              ].map((subject, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[11px] text-teal-50 mb-1.5 font-bold uppercase tracking-wider">
                    <span>{subject.name}</span>
                    <span>{subject.percent}</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-400 rounded-full shadow-[0_0_8px_rgba(45,212,191,0.5)]" style={{ width: subject.percent }}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Status Footer */}
            <div className="flex items-center gap-3 bg-black/20 p-3 rounded-lg border border-white/5">
              <i className="fa-solid fa-circle-check text-teal-400 text-sm drop-shadow-sm"></i>
              <span className="text-[11px] font-semibold text-white/90 tracking-wide uppercase">All assignments submitted</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Clean Login Form */}
      {/* <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-sm space-y-8"> */}

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50 lg:bg-white">
        <div className="w-full max-w-md p-8 sm:p-10 bg-white rounded-3xl shadow-xl border border-slate-200 md:!shadow-none md:border-none space-y-8">

          {/* Mobile Logo */}
          <div className="lg:hidden w-12 h-12 bg-teal-700 rounded-xl flex items-center justify-center shadow-sm mb-6">
            <i className="fa-solid fa-graduation-cap text-xl text-white"></i>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Sign In</h2>
            <p className="text-slate-500 font-medium">Enter your credentials to access your dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">

            <Input
              label="Email or Phone Number"
              id="identifier"
              type="text"
              placeholder="Enter your email or phone"
              leftIcon="fa-regular fa-user"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (errors.identifier) setErrors({ ...errors, identifier: '' });
              }}
              error={errors.identifier}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                leftIcon="fa-solid fa-lock"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                error={errors.password}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] flex items-center text-slate-400 hover:text-teal-700 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>

            {/* Remember Me / Forgot Password */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                {/* <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700 bg-white cursor-pointer"
                />
                <label htmlFor="remember" className="text-sm text-slate-600 font-medium select-none cursor-pointer">
                  Remember me
                </label> */}
              </div>
              <button type="button" onClick={()=> navigate(`/forgot-password`)} className="text-sm cursor-pointer font-semibold text-teal-700 hover:text-teal-800 transition-colors">
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              fullWidth
              isLoading={isPending}
              rightIcon={!isPending ? "fa-solid fa-arrow-right" : undefined}
              className="bg-teal-700 hover:bg-teal-800 text-white shadow-lg shadow-teal-700/20 border-none transition-all mt-6"
            >
              Sign in
            </Button>

            <div className="text-center text-sm text-slate-500 font-medium pt-4">
              Need help? <a href="#" className="font-semibold text-teal-700 hover:text-teal-800 underline underline-offset-4 transition-colors">Contact Support</a>
            </div>
          </form>

        </div>
      </div>
    </div>
  );

};

export default Login;