import { useEffect, useState } from "react";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";

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

const PlanPage = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("workouts"); // "workouts" or "meals"
  const [copyStatus, setCopyStatus] = useState(""); // grocery copy feedback

  const todayName = getTodayName();
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const fetchPlan = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/plan/current");
      setPlan(res.data);
    } catch (err) {
      setError("Failed to load plan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const groupedWorkouts = (plan?.workouts || []).reduce((acc, w) => {
    acc[w.day] = acc[w.day] || [];
    acc[w.day].push(w);
    return acc;
  }, {});

  const groupedMeals = (plan?.meals || []).reduce((acc, m) => {
    acc[m.day] = acc[m.day] || [];
    acc[m.day].push(m);
    return acc;
  }, {});

  // Plan summary (safe fallbacks)
  const goalLabel =
    plan?.goal === "fat_loss"
      ? "Fat Loss"
      : plan?.goal === "muscle_gain"
      ? "Muscle Gain"
      : plan?.goal === "maintain"
      ? "Maintain"
      : "Not set";

  const dietLabel = plan?.dietType
    ? plan.dietType.charAt(0).toUpperCase() + plan.dietType.slice(1)
    : "Not set";

  const activityLabel =
    plan?.activityLevel === "sedentary"
      ? "Sedentary"
      : plan?.activityLevel === "light"
      ? "Light"
      : plan?.activityLevel === "moderate"
      ? "Moderate"
      : plan?.activityLevel === "high"
      ? "High"
      : "Not set";

  // 🔹 Print / Export as PDF
  const handlePrint = () => {
    window.print();
  };

  // 🔹 Copy grocery list
  const handleCopyGroceries = async () => {
    if (!plan?.groceryList?.length) return;
    const text = plan.groceryList.join("\n");
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopyStatus("Copied!");
        setTimeout(() => setCopyStatus(""), 1500);
      } else {
        alert(
          "Copy is not supported in this browser. You can select and copy manually."
        );
      }
    } catch (e) {
      setCopyStatus("Failed to copy");
      setTimeout(() => setCopyStatus(""), 1500);
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
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
          Weekly Plan
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Your AI-generated personalized fitness and nutrition blueprint for the
          week
        </p>
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-800 backdrop-blur-sm"
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

      {/* Loading / Empty / Main */}
      {loading ? (
        <motion.div 
          className="rounded-2xl border border-gray-200 bg-white p-12 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="inline-flex flex-col items-center">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-gray-300 border-t-gray-900"></div>
            <p className="mt-4 text-sm text-gray-500">
              Loading your personalized plan...
            </p>
          </div>
        </motion.div>
      ) : !plan ? (
        <motion.div 
          className="rounded-2xl border border-gray-200 bg-white p-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div 
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
          >
            <svg
              className="h-8 w-8 text-gray-400"
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
          <h3 className="text-lg font-semibold text-gray-900">
            No Active Plan Found
          </h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            Generate a personalized AI fitness plan from your dashboard to get
            started.
          </p>
        </motion.div>
      ) : (
        <>
          {/* Plan Date Range + Summary + Print */}
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-4"
              whileHover={{ scale: 1.005 }}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <motion.svg
                    className="h-5 w-5 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </motion.svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Active Plan Period
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(plan.startDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                      <span className="mx-2 text-gray-400">→</span>
                      {new Date(plan.endDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={fetchPlan}
                    className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Refresh
                  </motion.button>
                  <motion.button
                    onClick={handlePrint}
                    className="text-sm px-3 py-1.5 rounded-lg border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Export / Print
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Plan Summary Pills */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-3 gap-2"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
                hidden: {}
              }}
            >
              <motion.div 
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <motion.span 
                  className="h-2 w-2 rounded-full bg-gray-900"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="font-medium text-gray-700">Goal:</span>
                <span className="text-gray-600">{goalLabel}</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <motion.span 
                  className="h-2 w-2 rounded-full bg-green-600"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                />
                <span className="font-medium text-gray-700">Diet:</span>
                <span className="text-gray-600">{dietLabel}</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <motion.span 
                  className="h-2 w-2 rounded-full bg-blue-600"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                />
                <span className="font-medium text-gray-700">Activity:</span>
                <span className="text-gray-600">{activityLabel}</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div 
            className="flex space-x-1 rounded-xl bg-gray-100 p-1 border border-gray-200 max-w-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              onClick={() => setActiveTab("workouts")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === "workouts"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              layout
            >
              Workouts
            </motion.button>
            <motion.button
              onClick={() => setActiveTab("meals")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === "meals"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              layout
            >
              Nutrition
            </motion.button>
          </motion.div>

          {/* Workouts Tab */}
          <AnimatePresence mode="wait">
            {activeTab === "workouts" && (
              <motion.div 
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                key="workouts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {days.map((day, index) => {
                  const isToday = day === todayName;
                  const count = groupedWorkouts[day]?.length || 0;

                  return (
                    <motion.div
                      key={day}
                      className={`rounded-2xl border bg-white p-5 transition-all hover:shadow-sm ${
                        isToday
                          ? "border-gray-900 ring-1 ring-gray-900/10 bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {day}
                          </h3>
                          {isToday && (
                            <motion.span 
                              className="text-[11px] px-2 py-0.5 rounded-full bg-gray-900 text-white font-medium"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring" }}
                            >
                              Today
                            </motion.span>
                          )}
                        </div>
                        <motion.span 
                          className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700"
                          whileHover={{ scale: 1.1 }}
                        >
                          {count} sessions
                        </motion.span>
                      </div>

                      {count === 0 ? (
                        <motion.div 
                          className="text-center py-6"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-3">
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
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-600">
                            Active recovery day
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Rest or light movement
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
                          {groupedWorkouts[day].map((w, idx) => (
                            <motion.div
                              key={idx}
                              className="rounded-xl border border-gray-100 bg-gray-50/50 p-3"
                              variants={{
                                hidden: { opacity: 0, y: 10 },
                                visible: { opacity: 1, y: 0 }
                              }}
                              whileHover={{ scale: 1.03, x: 2 }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-900">
                                  {w.bodyPart}
                                </span>
                                {w.duration && (
                                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                                    {w.duration}
                                  </span>
                                )}
                              </div>
                              <ul className="space-y-1.5">
                                {w.items.map((item, i) => (
                                  <motion.li
                                    key={i}
                                    className="flex items-start text-sm text-gray-700"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
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
                                    <span className="leading-tight">
                                      {item}
                                    </span>
                                  </motion.li>
                                ))}
                              </ul>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Meals Tab */}
            {activeTab === "meals" && (
              <motion.div 
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                key="meals"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {days.map((day, index) => {
                  const isToday = day === todayName;
                  const count = groupedMeals[day]?.length || 0;

                  return (
                    <motion.div
                      key={day}
                      className={`rounded-2xl border bg-white p-5 transition-all hover:shadow-sm ${
                        isToday
                          ? "border-green-700 ring-1 ring-green-700/10 bg-green-50/60"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {day}
                          </h3>
                          {isToday && (
                            <motion.span 
                              className="text-[11px] px-2 py-0.5 rounded-full bg-green-700 text-white font-medium"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring" }}
                              whileHover={{ scale: 1.2 }}
                            >
                              Today
                            </motion.span>
                          )}
                        </div>
                        <motion.span 
                          className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700"
                          whileHover={{ scale: 1.1 }}
                        >
                          {count} meals
                        </motion.span>
                      </div>

                      {count === 0 ? (
                        <motion.div 
                          className="text-center py-6"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-3">
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
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                              />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-600">
                            No meals scheduled
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Check back later
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div 
                          className="space-y-3"
                          initial="hidden"
                          animate="visible"
                          variants={{
                            visible: { transition: { staggerChildren: 0.1 } },
                            hidden: {}
                          }}
                        >
                          {groupedMeals[day]
                            .sort((a, b) =>
                              a.mealType.localeCompare(b.mealType)
                            )
                            .map((m, idx) => (
                              <motion.div
                                key={idx}
                                className="rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50/50 p-3 hover:border-gray-200 transition-colors"
                                variants={{
                                  hidden: { opacity: 0, y: 10 },
                                  visible: { opacity: 1, y: 0 }
                                }}
                                whileHover={{ scale: 1.03, x: 2 }}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold text-gray-900 capitalize">
                                    {m.mealType}
                                  </span>
                                  <motion.span 
                                    className="text-xs font-medium text-gray-700 bg-white px-2 py-1 rounded-full border border-gray-200"
                                    whileHover={{ scale: 1.1 }}
                                  >
                                    {m.approxCalories} kcal
                                  </motion.span>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">
                                  {m.description}
                                </p>
                                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
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
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grocery List Section */}
          <motion.div 
            className="rounded-2xl border border-gray-200 bg-white p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.005 }}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Grocery List
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Everything you need for the week ahead
                </p>
              </div>
              <div className="flex items-center gap-2">
                {plan.groceryList?.length ? (
                  <motion.button
                    onClick={handleCopyGroceries}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ 
                        scale: copyStatus ? [1, 1.2, 1] : 1 
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M8 16h8M8 12h8M9 8h6m2-4H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2z"
                      />
                    </motion.svg>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={copyStatus || "copy"}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {copyStatus || "Copy list"}
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>
                ) : null}
                <motion.div 
                  className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    transition: { duration: 2, repeat: Infinity }
                  }}
                >
                  <svg
                    className="h-4 w-4 text-green-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </motion.div>
              </div>
            </div>

            {plan.groceryList?.length ? (
              <motion.div 
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-3"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.05 } },
                  hidden: {}
                }}
              >
                {plan.groceryList.map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/50 p-3 hover:border-gray-300 transition-colors"
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    whileHover={{ scale: 1.03, x: 5 }}
                  >
                    <motion.div 
                      className="h-2 w-2 rounded-full bg-gray-400"
                      animate={{ 
                        scale: [1, 1.5, 1],
                        transition: { 
                          duration: 2,
                          repeat: Infinity,
                          delay: idx * 0.1 
                        }
                      }}
                    />
                    <span className="text-sm text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-3">
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
                </div>
                <p className="text-sm text-gray-600">
                  No grocery list available
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Regenerate plan to include groceries
                </p>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default PlanPage;