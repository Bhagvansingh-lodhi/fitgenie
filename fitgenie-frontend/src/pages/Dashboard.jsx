// src/pages/Dashboard.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion"; // Added Framer Motion

const getTodayName = () => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[new Date().getDay()];
};

const Dashboard = () => {
  const [plan, setPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const today = getTodayName();
  const todaysWorkout = plan?.workouts?.filter((w) => w.day === today) || [];
  const todaysMeals = plan?.meals?.filter((m) => m.day === today) || [];

  // AI steps for generate button
  const aiSteps = [
    "Analyzing your profile and latest stats…",
    "Designing workout split and intensity for this week…",
    "Balancing meals with your calories and macros…",
    "Finalizing today's schedule and recommendations…",
  ];
  const [aiStep, setAiStep] = useState(0);

  useEffect(() => {
    let intervalId;
    if (generating) {
      setAiStep(0);
      intervalId = setInterval(() => {
        setAiStep((prev) => {
          if (prev >= aiSteps.length - 1) return prev;
          return prev + 1;
        });
      }, 900);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [generating, aiSteps.length]);

  const fetchPlan = async () => {
    setLoadingPlan(true);
    setError("");
    try {
      const res = await api.get("/plan/current");
      setPlan(res.data);
    } catch (err) {
      setError("Failed to load plan");
    } finally {
      setLoadingPlan(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleGeneratePlan = async () => {
    setGenerating(true);
    setError("");
    try {
      await api.post("/plan/generate", {});
      await fetchPlan();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to generate plan. Check backend/AI key."
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div 
      className="space-y-8 p-1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div 
        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back! Here&apos;s your plan for{" "}
            <span className="font-medium text-gray-700">{today}</span>
          </p>
        </div>

        <div className="flex flex-col items-stretch sm:items-end gap-1.5">
          <motion.button
            onClick={handleGeneratePlan}
            disabled={generating}
            className="px-6 py-3 rounded-xl bg-gray-900 hover:bg-black text-white text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {generating ? (
              <span className="flex items-center gap-2">
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
                Generating...
              </span>
            ) : plan ? (
              "Regenerate Plan"
            ) : (
              "Generate New Plan"
            )}
          </motion.button>

          {/* AI status text + mini progress for generation */}
          <AnimatePresence>
            {generating && (
              <motion.div 
                className="text-[11px] text-gray-500 text-right"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                {aiSteps[aiStep]}
                <div className="mt-1 flex justify-end gap-1.5">
                  {aiSteps.map((_, idx) => (
                    <motion.span
                      key={idx}
                      className={`h-1 w-5 rounded-full transition-all ${
                        idx <= aiStep ? "bg-gray-900" : "bg-gray-200"
                      }`}
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ 
                        scale: idx <= aiStep ? 1 : 0.8,
                        opacity: idx <= aiStep ? 1 : 0.5
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-800 backdrop-blur-sm transition-all duration-200"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading / Empty / Main State */}
      {loadingPlan ? (
        <motion.div 
          className="rounded-2xl border border-gray-200 bg-white p-8 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-gray-300 border-t-gray-900"></div>
          <p className="mt-3 text-sm text-gray-500">
            Loading your personalized plan...
          </p>
        </motion.div>
      ) : !plan ? (
        <motion.div 
          className="rounded-2xl border border-gray-200 bg-white p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div 
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
          >
            <svg
              className="h-6 w-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </motion.div>
          <h3 className="text-lg font-medium text-gray-900">No Active Plan</h3>
          <p className="mt-2 text-sm text-gray-500 mb-4">
            Create your personalized fitness plan to get started
          </p>
          <motion.button
            onClick={handleGeneratePlan}
            className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-black hover:shadow-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Generate AI-Powered Plan
          </motion.button>
        </motion.div>
      ) : (
        <motion.div 
          className="grid md:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {/* Workout Card */}
          <motion.div 
            className="rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:shadow-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ y: -5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Today&apos;s Workout
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Your training schedule
                </p>
              </div>
              <motion.span 
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 uppercase tracking-wider"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {today}
              </motion.span>
            </div>

            {todaysWorkout.length === 0 ? (
              <motion.div 
                className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-5 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <svg
                  className="mx-auto h-8 w-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-500">
                  Rest day or light activity
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Enjoy active recovery
                </p>
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-4"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } },
                  hidden: {}
                }}
              >
                {todaysWorkout.map((w, idx) => (
                  <motion.div
                    key={idx}
                    className="rounded-xl border border-gray-100 bg-gray-50/50 p-4"
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {w.bodyPart}
                      </span>
                      <span className="text-xs text-gray-500">
                        {w.duration || "Custom session"}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {w.items.map((item, i) => (
                        <motion.li
                          key={i}
                          className="flex items-start text-sm text-gray-700"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 + 0.2 }}
                        >
                          <svg
                            className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </motion.div>
            )}

            <Link
              to="/plan"
              className="mt-6 inline-flex items-center text-sm font-medium text-gray-900 hover:text-black transition-colors group"
            >
              View full weekly plan
              <svg
                className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </motion.div>

          {/* Meals Card */}
          <motion.div 
            className="rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:shadow-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Today&apos;s Nutrition
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  AI-curated meal plan
                </p>
              </div>
              <motion.span 
                className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 uppercase tracking-wider"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                Nutrition
              </motion.span>
            </div>

            {todaysMeals.length === 0 ? (
              <motion.div 
                className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-5 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <svg
                  className="mx-auto h-8 w-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-500">
                  No meals generated
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Try regenerating your plan
                </p>
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-3 max-h-80 overflow-y-auto pr-2"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } },
                  hidden: {}
                }}
              >
                {todaysMeals.map((m, idx) => (
                  <motion.div
                    key={idx}
                    className="rounded-xl border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-xs"
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    whileHover={{ scale: 1.01, x: 5 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900 capitalize">
                        {m.mealType}
                      </span>
                      <motion.span 
                        className="text-xs font-medium text-gray-700 bg-gray-100 rounded-full px-2 py-1"
                        whileHover={{ scale: 1.1 }}
                      >
                        {m.approxCalories} kcal
                      </motion.span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {m.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <motion.span 
                        className="flex items-center gap-1"
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                        Protein: {m.proteinG}g
                      </motion.span>
                      <motion.span 
                        className="flex items-center gap-1"
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                        Carbs: {m.carbsG}g
                      </motion.span>
                      <motion.span 
                        className="flex items-center gap-1"
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className="h-2 w-2 rounded-full bg-red-500"></span>
                        Fat: {m.fatsG}g
                      </motion.span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Bottom CTA Card */}
      <motion.div 
        className="rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Track Your Progress
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Monitor consistency, weight changes, and performance metrics
            </p>
          </div>
          <Link
            to="/progress"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 transition-all hover:border-gray-400 hover:shadow-sm md:w-auto"
          >
            View Analytics
            <svg
              className="ml-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;