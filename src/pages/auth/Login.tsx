import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginUser } from '../../api_services/auth_api/authApi';
// import { setToken } from '../../lib/tokenManager';
import { setCredentials, setSchool } from '../../features/slices/authSlice';
// import { useToast } from '../../shared/ui/ToastContext';
import { Input } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';
import { toast } from '../../shared/ui/ToastContext';
import { DOMAIN_IMG, DOMAIN_NAME } from '../../constants/constants';

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
  const [activeFeature, setActiveFeature] = useState(0);




  const features = [
    {
      eyebrow: "Daily operations",
      title: "Attendance Tracking",
      status: "Today",
      metrics: [
        ["486", "Present"],
        ["21", "Absent"],
        ["96%", "Overall"]
      ],
      rows: [
        ["Class VIII A", "98%"],
        ["Class IX B", "95%"],
        ["Parent alerts sent", "21"]
      ],
      footerLeft: "Auto-sync enabled",
      footerRight: "Open attendance →"
    },

    {
      eyebrow: "Finance",
      title: "Fee Collection",
      status: "Secure",
      metrics: [
        ["₹8.4L", "Collected"],
        ["₹1.2L", "Pending"],
        ["88%", "Completion"]
      ],
      rows: [
        ["Online payments", "326"],
        ["Receipts generated", "326"],
        ["Overdue reminders", "42"]
      ],
      footerLeft: "Audit-ready records",
      footerRight: "View collections →"
    },


    {
      eyebrow: "Parent connection",
      title: "Communication Hub",
      status: "Connected",
      metrics: [
        ["92%", "Read rate"],
        ["146", "Messages"],
        ["12", "Notices"]
      ],
      rows: [
        ["Exam timetable shared", "Seen"],
        ["Homework update", "Sent"],
        ["Parent replies", "34"]
      ],
      footerLeft: "One place for every update",
      footerRight: "Open messages →"
    },


    {
      eyebrow: "Academic insights",
      title: "Student Performance",
      status: "Live",
      metrics: [
        ["85%", "Mathematics"],
        ["72%", "Physics"],
        ["90%", "English"]
      ],
      rows: [
        ["Assignments submitted", "18/18"],
        ["Average attendance", "94%"],
        ["Teacher feedback", "Updated"]
      ],
      footerLeft: "Updated 2 minutes ago",
      footerRight: "View report →"
    }

  ];



  useEffect(() => {

    const timer = setInterval(() => {

      setActiveFeature(prev =>
        (prev + 1) % features.length
      );

    }, 4000);


    return () => clearInterval(timer);


  }, []);


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
          profileImageUrl: response.user?.profileImage?.url || null,
          academicYear: response?.user?.academicYear || null,
          token: "",
          studentId: response?.user?.studentId || [],
          assignments: response?.user?.assignments || [],
          isPlatformAdmin: response?.user?.isPlatformAdmin || false,
          schoolName: response.user.schoolName || null
        }));

        dispatch(setSchool({
          schoolId: response.user?.schoolId?._id,
          schoolName: response.user?.schoolId?.name,
          schoollogoUrl: response.user.schoolId?.logo?.url
        }))
        // showToast(`Welcome back, ${response.user.userName}!`, 'success');
        toast.success(`Welcome back, ${response.user.userName}!`)


        // 3. SECURE ROUTING LOGIC: Check role and navigate accordingly
        if (response.user.role?.toLowerCase() === 'parent') {
          navigate('/dashboard/profile-selection');
        }
        else if (response.user.role?.toLowerCase() === 'teacher') {
          navigate(`/dashboard/attendance-report`)
        }
        else {
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
    <div className="min-h-screen w-full flex bg-slate-50 overflow-y-auto selection:bg-red-100">

      {/* LEFT SIDE BRAND SECTION */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center p-10 overflow-hidden bg-white">

        {/* Grid Background */}
        <div
          className="
          absolute inset-0
          bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),
          linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)]
          bg-[size:40px_40px]
          opacity-40
        "
        />

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-slate-200 opacity-50" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full border border-slate-200 opacity-40" />


        <div className="relative z-10 max-w-lg w-full">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-3">

            <div className="w-20 h-20 rounded-xl border border-slate-200 bg-white flex items-center justify-center shadow-sm">

              {/* Replace only this import */}
              <img
                src={DOMAIN_IMG}
                alt="Logo"
                className="w-18 h-18 object-contain"
              />

            </div>

            <span className="text-2xl font-bold text-[#0f172a]">
              {DOMAIN_NAME}
            </span>

          </div>


          <h1 className=" text-5xl font-bold leading-tight tracking-tight text-[#0f172a] mb-3
        ">
            Smart Learning
            <br />
            Management
          </h1>


          <div className="w-10 h-1 bg-[#e1061b] mb-6 rounded-full" />


          <p className=" text-md leading-relaxed text-slate-500 max-w-md mb-5
        ">
            The all-in-one ecosystem for educators and students.
            Manage your academic growth with precision and clarity.
          </p>



      
          {/* Animated Feature Slider */}

          <style>
            {`

.feature-stage{
  position:relative;
  height:390px;
  width:100%;
}


.feature-card-slider{

  --x:0px;
  --y:0px;
  --s:1;
  --r:0deg;
  --o:1;

  position:absolute;
  left:50%;
  top:50%;

  width:100%;

  transform:
  translate(calc(-50% + var(--x)),
  calc(-50% + var(--y)))
  scale(var(--s))
  rotate(var(--r));

  opacity:var(--o);

  transition:
  transform .75s cubic-bezier(.22,1,.36,1),
  opacity .6s ease;

  background:white;

  border:1px solid #e2e8f0;

  border-radius:24px;

  padding:24px;

  box-shadow:
  0 28px 60px rgba(15,23,42,.12);

}



.metric-box{

padding:14px;

border-radius:14px;

background:#fbfdff;

border:1px solid #e6ebf1;

}



.slider-row{

display:flex;
justify-content:space-between;
align-items:center;

padding:10px;

background:#f8fafc;

border-radius:12px;

font-size:13px;

}



.slider-dot{

width:9px;
height:9px;

border-radius:999px;

background:#cbd5e1;

transition:.3s;

}



.slider-dot.active{

width:28px;

background:#e1061b;

}



`
            }
          </style>



          <div className="feature-stage">


            {
              features.map((feature, index) => {


                const position =
                  (index - activeFeature + features.length)
                  % features.length;



                return (

                  <div
                    key={index}

                    className="feature-card-slider"
                    style={{
                      "--x":
                        position === 1
                          ? "35px"
                          : position === 2
                            ? "70px"
                            : position === 3
                              ? "-60px"
                              : "0px",

                      "--y":
                        position === 0
                          ? "0px"
                          : position === 1
                            ? "30px"
                            : "55px",


                      "--s":
                        position === 0
                          ? "1"
                          : position === 1
                            ? "0.94"
                            : "0.86",


                      "--o":
                        position === 0
                          ? "1"
                          : position === 1
                            ? "0.65"
                            : "0.25",


                      "--r":
                        position === 3
                          ? "-2deg"
                          : position === 2
                            ? "2deg"
                            : "0deg",


                      zIndex: 10 - position,


                    } as React.CSSProperties & {
                      [key: string]: string | number
                    }}
                  >


                    <div className="flex justify-between items-center mb-5">


                      <div className="flex gap-3 items-center">


                        <div className=" w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-[#e1061b]
">

                          <i className="fa-solid fa-chart-column" />

                        </div>



                        <div>

                          <p className="text-xs uppercase tracking-wider font-bold text-[#e1061b]
">

                            {feature.eyebrow}

                          </p>


                          <h3 className=" text-xl font-bold text-[#0f172a]
">

                            {feature.title}

                          </h3>


                        </div>

                      </div>



                      <span className=" px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold
">

                        {feature.status}

                      </span>


                    </div>




                    <div className=" grid grid-cols-3 gap-3 mb-5
">


                      {
                        feature.metrics.map((m, i) => (

                          <div className="metric-box" key={i}>

                            <strong className=" block text-xl font-bold
">

                              {m[0]}

                            </strong>


                            <span className=" text-xs font-semibold text-slate-500
">

                              {m[1]}

                            </span>


                          </div>


                        ))
                      }



                    </div>



                    <div className="space-y-2">


                      {
                        feature.rows.map((row, i) => (

                          <div
                            className="slider-row"
                            key={i}
                          >

                            <div className="flex gap-2 items-center">

                              <span className=" w-2 h-2 rounded-full bg-[#e1061b]
"/>


                              <span className="font-semibold">

                                {row[0]}

                              </span>


                            </div>


                            <b>

                              {row[1]}

                            </b>


                          </div>

                        ))

                      }


                    </div>



                    <div className=" flex justify-between mt-5 text-xs font-semibold text-slate-500
">


                      <span>
                        {feature.footerLeft}
                      </span>


                      <span>
                        {feature.footerRight}
                      </span>


                    </div>




                  </div>


                )

              })
            }



            <div className=" absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2
">

              {
                features.map((_, i) => (

                  <button
                    key={i}
                    onClick={() => setActiveFeature(i)}

                    className={`slider-dot ${activeFeature === i
                      ? "active"
                      : ""
                      }`}

                  />

                ))
              }

            </div>


          </div>




        </div>


      </div>





      {/* RIGHT LOGIN SECTION */}

      <div className=" w-full lg:w-1/2 flex items-center justify-center bg-slate-50 p-5 sm:p-10
    ">
        <div className=" w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10
      ">
          <section className="flex items-center gap-2 sm:gap-3 mb-8">

            <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center flex-shrink-0">
              <img
                src={DOMAIN_IMG}
                alt="Logo"
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
              />
            </div>

            <div className="flex flex-col justify-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-[#0f172a]">
                Sign In
              </h2>

              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Enter your credentials to access your dashboard.
              </p>
            </div>

          </section>




          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >


            <Input
              label="Email or Phone Number"
              id="identifier"
              type="text"
              placeholder="Enter your email or phone"
              leftIcon="fa-regular fa-user"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);

                if (errors.identifier)
                  setErrors({
                    ...errors,
                    identifier: ''
                  });
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

                  if (errors.password)
                    setErrors({
                      ...errors,
                      password: ''
                    });

                }}
                error={errors.password}
                required
              />


              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className=" absolute right-4 top-[36px] text-slate-400
              "
              >

                <i
                  className={`fa-regular ${showPassword
                    ? 'fa-eye-slash'
                    : 'fa-eye'
                    }`}
                />

              </button>


            </div>



            <div className="flex justify-end">

              <button
                type="button"
                onClick={() => navigate(`/forgot-password`)}
                className="
                text-sm
                font-semibold
                text-[#d81d1d]
              "
              >
                Forgot password?
              </button>

            </div>




            <Button
              type="submit"
              size="lg"
              fullWidth
              isLoading={isPending}
              rightIcon={!isPending ? "fa-solid fa-arrow-right" : undefined}

              className=" mt-3 text-white border-none bg-gradient-to-r from-[#e1061b] to-[#c8102e] hover:opacity-90 shadow-lg
            "
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