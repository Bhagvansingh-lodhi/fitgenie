import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const containerVariants = {
  hidden: { opacity: 0, y: 8 },
  enter: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      staggerChildren: 0.06,
      when: "beforeChildren"
    } 
  },
  exit: { 
    opacity: 0, 
    y: 8, 
    transition: { 
      when: "afterChildren",
      staggerChildren: 0.03,
      staggerDirection: -1 
    } 
  },
};

const fieldVariant = {
  hidden: { opacity: 0, y: 8 },
  enter: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.28,
      ease: "easeOut" 
    } 
  },
};

const errorVariant = {
  hidden: { opacity: 0, scale: 0.98, y: -5 },
  enter: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      type: "spring", 
      stiffness: 500, 
      damping: 25 
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.98, 
    y: -5,
    transition: { 
      duration: 0.15 
    } 
  },
};

const aiContainer = {
  hidden: { opacity: 0, scale: 0.995 },
  enter: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 25 
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.995, 
    transition: { 
      duration: 0.18 
    } 
  },
};

const progressDot = {
  inactive: { scale: 0.8, opacity: 0.3 },
  active: { 
    scale: 1.2, 
    opacity: 1, 
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 10 
    } 
  },
  pulse: {
    scale: [1, 1.3, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatDelay: 0.5
    }
  }
};

const stepText = {
  hidden: { opacity: 0, y: 8 },
  enter: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.25,
      ease: "easeOut" 
    } 
  },
  exit: { 
    opacity: 0, 
    y: -8,
    transition: { 
      duration: 0.2 
    } 
  },
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // "form" = normal login form, "ai" = AI loading screen
  const [loginPhase, setLoginPhase] = useState("form");
  const [aiStep, setAiStep] = useState(0);

  const aiSteps = [
    "Analyzing your fitness profile…",
    "Syncing your workout & nutrition data…",
    "Preparing your personalized dashboard…",
  ];

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", form);
      // Save auth in context
      login(res.data.user, res.data.token);

      // Stop button loader, switch to AI phase
      setLoading(false);
      setLoginPhase("ai");
      setAiStep(0);

      // Run AI loading steps then navigate
      let current = 0;
      const stepDuration = 700; // ms

      const runSequence = () => {
        current += 1;
        if (current < aiSteps.length) {
          setAiStep(current);
          setTimeout(runSequence, stepDuration);
        } else {
          navigate("/dashboard");
        }
      };

      // Start sequence
      setTimeout(runSequence, stepDuration);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
      setLoading(false);
    }
  };

  const isDisabled = loading || loginPhase === "ai";

  // Handle "Create Account" button click
  const handleCreateAccount = (e) => {
    e.preventDefault();
    // Navigate to register page with a smooth transition
    navigate("/register");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4,
            type: "spring",
            stiffness: 300,
            damping: 20 
          }}
          className="text-center mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-gray-900 to-black mb-4 shadow-lg relative cursor-pointer"
            onClick={() => navigate("/")}
          >
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{
                rotate: {
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                },
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }
              }}
              className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-white/30 border-r-white/10"
            />
            <span className="text-xl font-bold text-white relative z-10">F</span>
          </motion.div>
          <motion.h1 
            className="text-3xl font-bold text-gray-900 tracking-tight"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Welcome Back
          </motion.h1>
          <motion.p 
            className="text-gray-500 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Sign in to your AI-powered fitness journey
          </motion.p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.3,
            type: "spring",
            stiffness: 300,
            damping: 25 
          }}
          className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg backdrop-blur-sm"
        >
          <AnimatePresence mode="wait">
            {loginPhase === "form" ? (
              <motion.div
                key="form"
                variants={containerVariants}
                initial="hidden"
                animate="enter"
                exit="exit"
                className="relative"
              >
                {/* Background subtle animation */}
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/0 to-transparent"
                  animate={{
                    x: ["0%", "100%"],
                  }}
                  transition={{
                    x: {
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }
                  }}
                />
                
                {error && (
                  <motion.div
                    variants={errorVariant}
                    initial="hidden"
                    animate="enter"
                    exit="exit"
                    className="rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800 backdrop-blur-sm mb-6 relative overflow-hidden"
                  >
                    {/* Error icon animation */}
                    <motion.div
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.div>
                    <div className="ml-6">{error}</div>
                  </motion.div>
                )}

                <motion.form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                  {/* Email */}
                  <motion.div 
                    variants={fieldVariant}
                    className="space-y-2"
                    whileHover={{ scale: 1.01 }}
                  >
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <div className="relative">
                      <motion.input
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all"
                        value={form.email}
                        onChange={handleChange}
                        required
                        disabled={isDisabled}
                        whileFocus={{ scale: 1.02 }}
                      />
                      <motion.svg
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        animate={{ 
                          y: [0, -3, 0],
                          transition: {
                            duration: 2,
                            repeat: Infinity
                          }
                        }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </motion.svg>
                    </div>
                  </motion.div>

                  {/* Password */}
                  <motion.div 
                    variants={fieldVariant}
                    className="space-y-2"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Password</label>
                      <Link
                        to="/forgot-password"
                        className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <motion.input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all"
                        value={form.password}
                        onChange={handleChange}
                        required
                        disabled={isDisabled}
                        whileFocus={{ scale: 1.02 }}
                      />

                      {/* Show / Hide Toggle */}
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-9 top-1/2 -translate-y-1/2 text-[11px] font-medium text-gray-500 hover:text-gray-900 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </motion.button>

                      <motion.svg
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        animate={{ 
                          scale: showPassword ? [1, 1.2, 1] : 1,
                          transition: { duration: 0.3 }
                        }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </motion.svg>
                    </div>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isDisabled}
                    whileHover={!isDisabled ? { 
                      scale: 1.03, 
                      y: -2,
                      transition: { type: "spring", stiffness: 400 }
                    } : {}}
                    whileTap={!isDisabled ? { scale: 0.97 } : {}}
                    className="w-full mt-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-gray-900 to-black text-white font-medium hover:from-black hover:to-gray-900 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                    animate={{
                      boxShadow: isDisabled ? "none" : [
                        "0 4px 12px rgba(0,0,0,0.08)",
                        "0 6px 16px rgba(0,0,0,0.12)",
                        "0 4px 12px rgba(0,0,0,0.08)"
                      ]
                    }}
                    transition={{
                      boxShadow: {
                        duration: 2,
                        repeat: Infinity
                      }
                    }}
                  >
                    {/* Button shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 2
                      }}
                    />
                    
                    {loading ? (
                      <span className="flex items-center justify-center gap-2 relative z-10">
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      <span className="relative z-10">Sign In to Dashboard</span>
                    )}
                  </motion.button>
                </motion.form>

                <motion.div 
                  variants={fieldVariant} 
                  className="mt-8 pt-6 border-t border-gray-200"
                >
                  <p className="text-center text-sm text-gray-500">
                    Don&apos;t have an account?{" "}
                    <motion.button
                      onClick={handleCreateAccount}
                      className="font-medium text-gray-900 hover:text-black transition-colors inline-flex items-center gap-1 group bg-transparent border-none p-0 cursor-pointer"
                      whileHover={{ scale: 1.05, x: 2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Create account
                      <motion.svg 
                        className="h-4 w-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        initial={{ x: 0 }}
                        animate={{ x: [0, 3, 0] }}
                        transition={{ 
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 1 
                        }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </motion.svg>
                    </motion.button>
                  </p>
                </motion.div>
              </motion.div>
            ) : (
              // 🔥 AI LOGIN PHASE
              <motion.div
                key="ai"
                variants={aiContainer}
                initial="hidden"
                animate="enter"
                exit="exit"
                className="py-6 space-y-5 relative"
              >
                {/* Background particles */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  {[...Array(15)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute h-1 w-1 bg-gray-300/20 rounded-full"
                      initial={{
                        x: Math.random() * 100 + '%',
                        y: Math.random() * 100 + '%',
                      }}
                      animate={{
                        y: [null, '-10px', '10px', null],
                        opacity: [0.2, 0.5, 0.2],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>

                <div className="flex flex-col items-center gap-4 relative z-10">
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      rotate: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      },
                      scale: {
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }
                    }}
                    className="h-12 w-12 rounded-full border-4 border-gray-900 border-t-transparent relative"
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-transparent border-r-gray-900/30"
                      animate={{ rotate: -360 }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  </motion.div>
                  
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={aiStep}
                      variants={stepText}
                      initial="hidden"
                      animate="enter"
                      exit="exit"
                      className="text-sm font-semibold text-gray-900 text-center"
                    >
                      {aiSteps[aiStep]}
                    </motion.p>
                  </AnimatePresence>

                  <motion.p 
                    className="text-xs text-gray-500"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Personalizing your FitGenie experience...
                  </motion.p>
                </div>

                {/* Progress indicator */}
                <div className="flex justify-center gap-2 mt-2 relative z-10">
                  {aiSteps.map((_, idx) => (
                    <motion.span
                      key={idx}
                      variants={progressDot}
                      initial="inactive"
                      animate={idx <= aiStep ? (idx === aiStep ? "pulse" : "active") : "inactive"}
                      className={`h-1.5 w-6 rounded-full ${
                        idx <= aiStep ? "bg-gray-900" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>

                <motion.p 
                  className="text-[11px] text-center text-gray-400 mt-4 relative z-10"
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  This usually takes just a moment. Your workouts, meals, and progress insights are being loaded securely.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Additional Features */}
        <motion.div 
          className="mt-8 grid grid-cols-3 gap-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, staggerChildren: 0.1 }}
        >
          {[
            { 
              icon: "M13 10V3L4 14h7v7l9-11h-7z", 
              color: "blue", 
              text: "AI-Powered",
              bgColor: "bg-blue-100",
              textColor: "text-blue-600"
            },
            { 
              icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", 
              color: "green", 
              text: "Personalized",
              bgColor: "bg-green-100",
              textColor: "text-green-600"
            },
            { 
              icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", 
              color: "purple", 
              text: "Track Progress",
              bgColor: "bg-purple-100",
              textColor: "text-purple-600"
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="rounded-xl border border-gray-200 bg-white p-4 cursor-pointer"
              whileHover={{ 
                y: -5, 
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/register")}
            >
              <motion.div 
                className={`h-8 w-8 mx-auto mb-2 rounded-full ${item.bgColor} flex items-center justify-center`}
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  transition: { 
                    duration: 3, 
                    repeat: Infinity,
                    repeatDelay: 2 
                  }
                }}
              >
                <svg 
                  className={`h-4 w-4 ${item.textColor}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon} />
                </svg>
              </motion.div>
              <p className="text-xs text-gray-600">{item.text}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Alternative registration button */}
        <motion.div 
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            onClick={handleCreateAccount}
            className="text-sm px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 inline-flex items-center gap-2"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Create New Account
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;