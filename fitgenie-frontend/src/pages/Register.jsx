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
      duration: 0.26,
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

const getStrengthColor = (lvl) =>
  [
    "bg-gray-200",
    "bg-red-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ][lvl];

const getStrengthTextColor = (lvl) =>
  [
    "text-gray-600",
    "text-red-600",
    "text-yellow-600",
    "text-blue-600",
    "text-green-600",
  ][lvl];

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // "form" = normal registration form, "ai" = AI onboarding animation
  const [phase, setPhase] = useState("form");
  const [aiStep, setAiStep] = useState(0);

  const aiSteps = [
    "Creating your FitGenie profile…",
    "Designing your first workout & meal plan…",
    "Preparing your personalized onboarding questions…",
  ];

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Password strength meter
    if (name === "password") {
      let strength = 0;
      if (value.length >= 8) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      if (/[^A-Za-z0-9]/.test(value)) strength++;
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", form);
      // Save auth
      login(res.data.user, res.data.token);

      // Switch to AI onboarding phase
      setLoading(false);
      setPhase("ai");
      setAiStep(0);

      let current = 0;
      const stepDuration = 800; // ms between step text

      const runSequence = () => {
        current += 1;
        if (current < aiSteps.length) {
          setAiStep(current);
          setTimeout(runSequence, stepDuration);
        } else {
          navigate("/onboarding");
        }
      };

      setTimeout(runSequence, stepDuration);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  const strengthPercent = (passwordStrength / 4) * 100;
  const isDisabled = loading || phase === "ai";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      <div className="w-full max-w-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4,
            type: "spring",
            stiffness: 300,
            damping: 20 
          }}
          className="text-center mb-10"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-gray-900 to-black mb-6 shadow-lg relative"
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
            <motion.span 
              className="text-2xl font-bold text-white relative z-10"
              animate={{ 
                y: [0, -5, 0],
                transition: {
                  duration: 2,
                  repeat: Infinity
                }
              }}
            >
              🏋️‍♂️
            </motion.span>
          </motion.div>
          <motion.h1 
            className="text-3xl font-bold text-gray-900 tracking-tight"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Join FitGenie AI
          </motion.h1>
          <motion.p 
            className="text-gray-500 mt-3 text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Start your personalized fitness journey today
          </motion.p>
        </motion.div>

        {/* Card - Made wider with more padding */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.3,
            type: "spring",
            stiffness: 300,
            damping: 25 
          }}
          className="rounded-2xl border border-gray-200 bg-white p-10 shadow-xl backdrop-blur-sm"
        >
          <AnimatePresence mode="wait">
            {phase === "form" ? (
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
                    className="rounded-xl border border-red-200 bg-red-50/90 px-5 py-4 text-sm text-red-800 backdrop-blur-sm mb-8 relative overflow-hidden"
                  >
                    {/* Error icon animation */}
                    <motion.div
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.div>
                    <div className="ml-8">{error}</div>
                  </motion.div>
                )}

                {/* FORM */}
                <motion.form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  {/* Name */}
                  <motion.div 
                    variants={fieldVariant}
                    className="space-y-2"
                    whileHover={{ scale: 1.01 }}
                  >
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <div className="relative">
                      <motion.input
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={handleChange}
                        required
                        disabled={isDisabled}
                        className="w-full px-5 py-4 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all disabled:bg-gray-100 text-base"
                        whileFocus={{ scale: 1.01 }}
                      />
                      <motion.svg
                        className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </motion.svg>
                    </div>
                  </motion.div>

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
                        value={form.email}
                        onChange={handleChange}
                        required
                        disabled={isDisabled}
                        className="w-full px-5 py-4 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all disabled:bg-gray-100 text-base"
                        whileFocus={{ scale: 1.01 }}
                      />
                      <motion.svg
                        className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
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
                    <label className="text-sm font-medium text-gray-700">Create Password</label>
                    <div className="relative">
                      <motion.input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 8 characters with uppercase, number, and special character"
                        value={form.password}
                        onChange={handleChange}
                        required
                        disabled={isDisabled}
                        className="w-full px-5 py-4 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all disabled:bg-gray-100 text-base pr-24"
                        whileFocus={{ scale: 1.01 }}
                      />

                      {/* Show / Hide toggle */}
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5 bg-gray-100 rounded-lg"
                        disabled={isDisabled}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </motion.button>
                    </div>

                    {/* Strength Bar */}
                    {form.password && (
                      <motion.div 
                        className="mt-4 p-4 bg-gray-50 rounded-xl"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-700 font-medium">Password Strength:</span>
                          <motion.span 
                            className={`font-semibold ${getStrengthTextColor(passwordStrength)}`}
                            key={passwordStrength}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring" }}
                          >
                            {["Too weak", "Weak", "Fair", "Good", "Strong"][passwordStrength]}
                          </motion.span>
                        </div>

                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
                          <motion.div
                            className={`h-full rounded-full ${getStrengthColor(passwordStrength)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${strengthPercent}%` }}
                            transition={{ 
                              type: "spring", 
                              stiffness: 300, 
                              damping: 30,
                              duration: 0.5 
                            }}
                          />
                        </div>

                        {/* Strength indicators */}
                        <motion.div 
                          className="grid grid-cols-2 gap-3 mt-3 text-sm text-gray-600"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {[
                            { label: "8+ characters", met: form.password.length >= 8 },
                            { label: "Uppercase letter", met: /[A-Z]/.test(form.password) },
                            { label: "Number (0-9)", met: /[0-9]/.test(form.password) },
                            { label: "Special character", met: /[^A-Za-z0-9]/.test(form.password) }
                          ].map((req, idx) => (
                            <motion.div
                              key={idx}
                              className="flex items-center gap-2"
                              animate={req.met ? { 
                                x: [0, 3, 0],
                                transition: { delay: idx * 0.1 }
                              } : {}}
                            >
                              <motion.div
                                className={`h-2 w-2 rounded-full ${req.met ? 'bg-green-500' : 'bg-gray-300'}`}
                                animate={req.met ? { 
                                  scale: [1, 1.5, 1],
                                  transition: { delay: idx * 0.1 }
                                } : {}}
                              />
                              <span className={req.met ? "text-green-600 font-medium" : ""}>
                                {req.label}
                              </span>
                            </motion.div>
                          ))}
                        </motion.div>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Button */}
                  <motion.button
                    type="submit"
                    disabled={isDisabled}
                    whileHover={!isDisabled ? { 
                      scale: 1.02, 
                      y: -2,
                      transition: { type: "spring", stiffness: 400 }
                    } : {}}
                    whileTap={!isDisabled ? { scale: 0.98 } : {}}
                    className="w-full mt-4 px-6 py-4 rounded-xl bg-gradient-to-r from-gray-900 to-black text-white font-medium hover:from-black hover:to-gray-900 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden text-base font-semibold"
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
                    
                    <span className="flex items-center justify-center gap-3 relative z-10">
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white"
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
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <motion.svg 
                            className="h-5 w-5" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            animate={{ 
                              x: [0, 3, 0],
                              transition: { 
                                duration: 1.5,
                                repeat: Infinity,
                                repeatDelay: 1 
                              }
                            }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </motion.svg>
                        </>
                      )}
                    </span>
                  </motion.button>
                </motion.form>

                {/* Login redirect */}
                <motion.div 
                  variants={fieldVariant} 
                  className="mt-8 pt-6 border-t border-gray-200"
                >
                  <p className="text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-medium text-gray-900 hover:text-black transition-colors inline-flex items-center gap-2 group text-base"
                    >
                      Sign in
                      <motion.svg 
                        className="h-5 w-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        initial={{ x: 0 }}
                        whileHover={{ x: 3 }}
                        transition={{ duration: 0.2 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </motion.svg>
                    </Link>
                  </p>
                </motion.div>
              </motion.div>
            ) : (
              // 🔥 AI Onboarding Phase
              <motion.div
                key="ai"
                variants={aiContainer}
                initial="hidden"
                animate="enter"
                exit="exit"
                className="py-8 space-y-6 relative"
              >
                {/* Background particles */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  {[...Array(20)].map((_, i) => (
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

                <div className="flex flex-col items-center gap-5 relative z-10">
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
                    className="h-16 w-16 rounded-full border-4 border-gray-900 border-t-transparent relative"
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
                      className="text-base font-semibold text-gray-900 text-center"
                    >
                      {aiSteps[aiStep]}
                    </motion.p>
                  </AnimatePresence>

                  <motion.p 
                    className="text-sm text-gray-500 text-center max-w-md"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    We&apos;re using your info to build a tailored workout and meal experience inside FitGenie.
                  </motion.p>
                </div>

                {/* Progress indicator */}
                <div className="flex justify-center gap-3 mt-4 relative z-10">
                  {aiSteps.map((_, idx) => (
                    <motion.span
                      key={idx}
                      variants={progressDot}
                      initial="inactive"
                      animate={idx <= aiStep ? (idx === aiStep ? "pulse" : "active") : "inactive"}
                      className={`h-2 w-8 rounded-full ${
                        idx <= aiStep ? "bg-gray-900" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>

                <motion.p 
                  className="text-xs text-center text-gray-400 mt-6 relative z-10"
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  This only takes a moment. Next, we&apos;ll ask a few quick questions to customize your goals.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Feature highlights - Wider layout */}
        <motion.div 
          className="mt-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-medium text-gray-700 mb-4">Everything you get with FitGenie:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { text: "AI Workouts", icon: "💪", desc: "Personalized plans" },
              { text: "Smart Meals", icon: "🥗", desc: "Nutrition tracking" },
              { text: "Progress Analytics", icon: "📊", desc: "Detailed insights" },
              { text: "24/7 AI Support", icon: "🤖", desc: "Always available" }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                className="flex flex-col items-center p-4 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl"
                whileHover={{ 
                  scale: 1.05, 
                  y: -3,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="text-2xl mb-2"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    transition: { 
                      duration: 3, 
                      repeat: Infinity,
                      repeatDelay: 2 
                    }
                  }}
                >
                  {feature.icon}
                </motion.div>
                <div className="font-medium text-gray-900">{feature.text}</div>
                <div className="text-xs text-gray-500 mt-1">{feature.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;