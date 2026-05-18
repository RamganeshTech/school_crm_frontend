// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
// import { useLoginUser } from '../../api_services/auth_api/authApi';
// import { setToken } from '../../lib/tokenManager';
// import { setCredentials } from '../../features/slices/authSlice';
// import { useToast } from '../../shared/ui/ToastContext';
// import { Input } from '../../shared/ui/Input';
// import { Button } from '../../shared/ui/Button';

// // ⭐ IMPORT YOUR CUSTOM UI COMPONENTS ⭐
// // import { Input } from '../../components/ui/Input';   // Adjust path as needed
// // import { Button } from '../../components/ui/Button'; // Adjust path as needed

// // import { useToast } from '../../context/ToastContext';

// const Login = () => {
//   const [identifier, setIdentifier] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);

//   // Validation State
//   const [errors, setErrors] = useState({ identifier: '', password: '' });

//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { mutateAsync, isPending } = useLoginUser();

//   const { showToast } = useToast();

//   // ⭐ VALIDATION LOGIC ⭐
//   const validateForm = () => {
//     let isValid = true;
//     const newErrors = { identifier: '', password: '' };

//     if (!identifier.trim()) {
//       newErrors.identifier = 'Email or phone number is required';
//       isValid = false;
//     }

//     if (!password) {
//       newErrors.password = 'Password is required';
//       isValid = false;
//     } else if (password.length < 8) {
//       newErrors.password = 'Password must be at least 8 characters long';
//       isValid = false;
//     }

//     setErrors(newErrors);
//     return isValid;
//   };

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // 1. Block API call if validation fails
//     if (!validateForm()) return; 

//     try {
//       const response = await mutateAsync({ identifier, password });

//       if (response.ok) {
//         setToken(response.token);

//         const schoolIdString = typeof response.user.schoolId === 'object' 
//             ? response.user.schoolId?._id 
//             : response.user.schoolId;

//         dispatch(setCredentials({
//           _id: response.user._id,
//           userName: response.user.userName,
//           schoolId: schoolIdString || '', 
//           role: response.user.role,
//           token: response.token
//         }));
//         showToast(`Welcome back, ${response.user.userName}!`, 'success');

//         navigate('/accountantlogin'); 
//       }
//     } catch (error: any) {
//       // Show backend errors (like "Invalid credentials") directly on the password field
//       setErrors({ ...errors, password: error.message || 'Invalid credentials' });
//     }
//   };

//   return (
//     <div className="w-full h-full flex bg-background font-sans overflow-y-auto">

//       {/* LEFT SIDE: Learning Graphic / Branding (Hidden on Mobile) */}
//       <div className="hidden lg:flex lg:w-1/2 bg-primary-soft relative flex-col items-center justify-center p-12 overflow-hidden border-r border-divider">
//         {/* Background decorative elements */}
//         <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl"></div>
//         <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary opacity-20 rounded-full blur-3xl"></div>

//         <div className="relative z-10 w-full max-w-lg text-center">
//           <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-8">
//             <i className="fa-solid fa-graduation-cap text-4xl text-white"></i>
//           </div>
//           <h1 className="text-4xl font-bold text-content mb-4">Empower Your Learning Journey</h1>
//           <p className="text-lg text-content-muted leading-relaxed">
//             Access world-class courses, track your progress, and collaborate with peers in a distraction-free environment.
//           </p>

//           <div className="mt-12 w-full h-64 bg-surface rounded-2xl shadow-xl border border-divider p-6 flex flex-col gap-4 transform rotate-1 hover:rotate-0 transition-transform duration-500">
//             <div className="w-full h-8 bg-background rounded border border-divider"></div>
//             <div className="flex gap-4 h-full">
//               <div className="w-1/3 h-full bg-primary-soft rounded border border-divider flex items-center justify-center">
//                 <i className="fa-solid fa-chart-line text-primary opacity-50 text-2xl"></i>
//               </div>
//               <div className="w-2/3 flex flex-col gap-4">
//                 <div className="w-full h-1/2 bg-background rounded border border-divider"></div>
//                 <div className="w-full h-1/2 bg-background rounded border border-divider"></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* RIGHT SIDE: Login Form */}
//       <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
//         <div className="w-full max-w-md bg-surface p-8 sm:p-10 rounded-2xl shadow-lg border border-divider">

//           {/* Mobile Logo */}
//           <div className="lg:hidden w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-sm mb-6">
//             <i className="fa-solid fa-graduation-cap text-xl text-white"></i>
//           </div>

//           <h2 className="text-2xl sm:text-3xl font-bold text-content mb-2">Welcome back</h2>
//           <p className="text-sm text-content-muted mb-8">Please enter your details to sign in.</p>

//           <form onSubmit={handleLogin} className="space-y-5">

//             {/* ⭐ CUSTOM INPUT: Identifier ⭐ */}
//             <Input
//               label="Email or Phone Number"
//               id="identifier"
//               type="text"
//               placeholder="Enter your email or phone"
//               leftIcon="fa-regular fa-user"
//               value={identifier}
//               onChange={(e) => {
//                 setIdentifier(e.target.value);
//                 // Clear error immediately when user starts typing
//                 if (errors.identifier) setErrors({ ...errors, identifier: '' });
//               }}
//               error={errors.identifier}
//               required
//             />

//             {/* ⭐ CUSTOM INPUT: Password ⭐ */}
//             <div className="relative">
//               <Input
//                 label="Password"
//                 id="password"
//                 type={showPassword ? 'text' : 'password'}
//                 placeholder="••••••••"
//                 leftIcon="fa-solid fa-lock"
//                 value={password}
//                 onChange={(e) => {
//                   setPassword(e.target.value);
//                   // Clear error immediately when user starts typing
//                   if (errors.password) setErrors({ ...errors, password: '' });
//                 }}
//                 error={errors.password}
//                 required
//               />

//               {/* Clickable Show/Hide Toggle Overlay */}
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 // Positioned 34px from top to align perfectly with the input box (ignoring the label/error text)
//                 className="absolute right-3 top-[34px] flex items-center text-content-muted hover:text-primary transition-colors cursor-pointer"
//                 tabIndex={-1}
//               >
//                 <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
//               </button>
//             </div>

//             {/* Remember Me / Forgot Password */}
//             <div className="flex items-center justify-between mt-2">
//               <div className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   id="remember"
//                   className="w-4 h-4 rounded border-divider text-primary focus:ring-primary bg-background cursor-pointer"
//                 />
//                 <label htmlFor="remember" className="text-sm text-content-muted select-none cursor-pointer">
//                   Remember me
//                 </label>
//               </div>
//               <a href="#" className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors">
//                 Forgot password?
//               </a>
//             </div>

//             {/* ⭐ CUSTOM BUTTON: Submit ⭐ */}
//             <Button
//               type="submit"
//               variant="primary"
//               size="lg"
//               fullWidth
//               isLoading={isPending} // Automatically handles the spinner and disabled state!
//               rightIcon={!isPending ? "fa-solid fa-arrow-right" : undefined}
//               className="mt-6"
//             >
//               Sign in
//             </Button>

//           </form>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;



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
          isPlatformAdmin: response?.user?.isPlatformAdmin || false
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

  return (
    <div className="w-full h-full flex bg-background font-sans overflow-y-auto">

      {/* LEFT SIDE: Learning Graphic / Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-soft relative flex-col items-center justify-center p-12 overflow-hidden border-r border-border">
        {/* Background decorative elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary opacity-20 rounded-full blur-3xl"></div>

        <div className="relative z-10 w-full max-w-lg text-center">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-8">
            <i className="fa-solid fa-graduation-cap text-4xl text-inverse"></i>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Empower Your Learning Journey</h1>
          <p className="text-lg text-muted leading-relaxed">
            Access world-class courses, track your progress, and collaborate with peers in a distraction-free environment.
          </p>

          <div className="mt-12 w-full h-64 bg-surface rounded-2xl shadow-xl border border-border p-6 flex flex-col gap-4 transform rotate-1 hover:rotate-0 transition-transform duration-500">
            <div className="w-full h-8 bg-background rounded border border-border"></div>
            <div className="flex gap-4 h-full">
              <div className="w-1/3 h-full bg-primary-soft rounded border border-border flex items-center justify-center">
                <i className="fa-solid fa-chart-line text-primary opacity-50 text-2xl"></i>
              </div>
              <div className="w-2/3 flex flex-col gap-4">
                <div className="w-full h-1/2 bg-background rounded border border-border"></div>
                <div className="w-full h-1/2 bg-background rounded border border-border"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-surface p-8 sm:p-10 rounded-2xl shadow-lg border border-border">

          {/* Mobile Logo */}
          <div className="lg:hidden w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-sm mb-6">
            <i className="fa-solid fa-graduation-cap text-xl text-inverse"></i>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Welcome back</h2>
          <p className="text-sm text-muted mb-8">Please enter your details to sign in.</p>

          <form onSubmit={handleLogin} className="space-y-5 p-6">

            {/* ⭐ CUSTOM INPUT: Identifier ⭐ */}
            <Input
              label="Email or Phone Number"
              id="identifier"
              type="text"
              placeholder="Enter your email or phone"
              leftIcon="fa-regular fa-user"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                // Clear error immediately when user starts typing
                if (errors.identifier) setErrors({ ...errors, identifier: '' });
              }}
              error={errors.identifier}
              required
            />

            {/* ⭐ CUSTOM INPUT: Password ⭐ */}
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
                  // Clear error immediately when user starts typing
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                error={errors.password}
                required
              />

              {/* Clickable Show/Hide Toggle Overlay */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                // Positioned 34px from top to align perfectly with the input box (ignoring the label/error text)
                className="absolute right-3 top-[34px] flex items-center text-muted hover:text-primary transition-colors cursor-pointer"
                tabIndex={-1}
              >
                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>

            {/* Remember Me / Forgot Password */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-background cursor-pointer"
                />
                <label htmlFor="remember" className="text-sm text-muted select-none cursor-pointer">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors">
                Forgot password?
              </a>
            </div>

            {/* ⭐ CUSTOM BUTTON: Submit ⭐ */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isPending} // Automatically handles the spinner and disabled state!
              rightIcon={!isPending ? "fa-solid fa-arrow-right" : undefined}
              className="mt-6"
            >
              Sign in
            </Button>

          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;