import { useEffect, useState } from "react";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";

const ProgressPage = () => {
  const [form, setForm] = useState({
    date: "",
    weightKg: "",
    workoutCompleted: false,
    mealsFollowedPercent: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [list, setList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [viewMode, setViewMode] = useState("table"); // "table" or "cards"

  const todayISO = new Date().toISOString().slice(0, 10);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const fetchProgress = async () => {
    setLoadingList(true);
    setError("");
    try {
      const res = await api.get("/progress");
      setList(res.data || []);
    } catch (err) {
      setError("Failed to load progress");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    setForm((prev) => ({ ...prev, date: todayISO }));
    fetchProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        weightKg: form.weightKg ? Number(form.weightKg) : undefined,
        mealsFollowedPercent: form.mealsFollowedPercent
          ? Number(form.mealsFollowedPercent)
          : undefined,
      };
      await api.post("/progress", payload);
      await fetchProgress();
      // Reset form
      setForm({
        date: todayISO,
        weightKg: "",
        workoutCompleted: false,
        mealsFollowedPercent: "",
        notes: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save progress");
    } finally {
      setSaving(false);
    }
  };

  // Sorted list (newest first) - avoid mutating state
  const sortedList = [...list].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Calculate workout streak (continuous completed days from latest backwards)
  const workoutStreak = (() => {
    if (!sortedList.length) return 0;
    let streak = 0;
    let prevDate = null;

    for (let i = 0; i < sortedList.length; i++) {
      const item = sortedList[i];
      if (!item.workoutCompleted) {
        if (i === 0) {
          // latest day skipped → streak 0
          return 0;
        }
        break;
      }
      const currDate = new Date(item.date);
      if (prevDate) {
        const diffDays =
          (prevDate - currDate) / (1000 * 60 * 60 * 24);
        if (diffDays !== 1) {
          break;
        }
      }
      streak++;
      prevDate = currDate;
    }
    return streak;
  })();

  // Average meal completion
  const avgCompletion =
    list.length > 0
      ? Math.round(
          list.reduce(
            (acc, item) => acc + (item.mealsFollowedPercent || 0),
            0
          ) / list.length
        )
      : 0;

  // ==========================
  //   Weight Trend Line Chart
  // ==========================

  const weightData = [...sortedList]
    .filter((item) => typeof item.weightKg === "number")
    .sort((a, b) => new Date(a.date) - new Date(b.date)) // oldest → newest for chart
    .map((item) => ({
      date: item.date,
      label: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value: item.weightKg,
    }));

  const hasWeightData = weightData.length > 1;

  const chartWidth = 600;
  const chartHeight = 180;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  let points = "";
  let minWeight = 0;
  let maxWeight = 0;

  if (hasWeightData) {
    minWeight = Math.min(...weightData.map((d) => d.value));
    maxWeight = Math.max(...weightData.map((d) => d.value));

    if (maxWeight === minWeight) {
      // same weight → flat line, give small range
      minWeight = minWeight - 1;
      maxWeight = maxWeight + 1;
    }

    const innerWidth = chartWidth - paddingLeft - paddingRight;
    const innerHeight = chartHeight - paddingTop - paddingBottom;

    points = weightData
      .map((d, idx) => {
        const x =
          paddingLeft +
          (weightData.length === 1
            ? innerWidth / 2
            : (innerWidth * idx) / (weightData.length - 1));
        const normalized =
          (d.value - minWeight) / (maxWeight - minWeight);
        const y =
          paddingTop + (1 - normalized) * innerHeight;
        return `${x},${y}`;
      })
      .join(" ");
  }

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
          Progress Tracker
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Log your daily metrics and visualize your fitness journey over time
        </p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } },
          hidden: {}
        }}
      >
        <motion.div 
          className="rounded-2xl border border-gray-200 bg-white p-5"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Logs</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {list.length}
              </p>
            </div>
            <motion.div 
              className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <svg
                className="h-5 w-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          className="rounded-2xl border border-gray-200 bg-white p-5"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Workout Streak</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {workoutStreak} days
              </p>
            </div>
            <motion.div 
              className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center"
              animate={{ 
                scale: [1, 1.1, 1],
                transition: { 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1 
                }
              }}
            >
              <svg
                className="h-5 w-5 text-green-600"
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
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          className="rounded-2xl border border-gray-200 bg-white p-5"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Completion</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {avgCompletion}%
              </p>
            </div>
            <motion.div 
              className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center"
              animate={{ 
                rotate: [0, 180, 360],
                transition: { 
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear" 
                }
              }}
            >
              <svg
                className="h-5 w-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Weight Trend Line Chart */}
      <motion.div 
        className="rounded-2xl border border-gray-200 bg-white p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Weight Trend
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              See how your weight is changing over time
            </p>
          </div>
          {hasWeightData && (
            <motion.div 
              className="text-xs text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Latest:{" "}
              <span className="font-medium text-gray-900">
                {weightData[weightData.length - 1].value} kg
              </span>
            </motion.div>
          )}
        </div>

        {!hasWeightData ? (
          <motion.div 
            className="py-8 text-sm text-gray-500 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Add at least 2 logs with weight to see your trend graph.
          </motion.div>
        ) : (
          <motion.div 
            className="w-full overflow-x-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <svg
              width={chartWidth}
              height={chartHeight}
              className="text-gray-400"
            >
              {/* Axes */}
              <line
                x1={paddingLeft}
                y1={chartHeight - paddingBottom}
                x2={chartWidth - paddingRight}
                y2={chartHeight - paddingBottom}
                stroke="#E5E7EB"
                strokeWidth="1"
              />
              <line
                x1={paddingLeft}
                y1={paddingTop}
                x2={paddingLeft}
                y2={chartHeight - paddingBottom}
                stroke="#E5E7EB"
                strokeWidth="1"
              />

              {/* Horizontal grid lines */}
              {[0, 0.5, 1].map((t, idx) => {
                const y =
                  paddingTop +
                  t * (chartHeight - paddingTop - paddingBottom);
                const value =
                  maxWeight - t * (maxWeight - minWeight);
                return (
                  <g key={idx}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={chartWidth - paddingRight}
                      y2={y}
                      stroke="#F3F4F6"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="10"
                      fill="#9CA3AF"
                    >
                      {value.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Line path */}
              <motion.polyline
                fill="none"
                stroke="#111827"
                strokeWidth="2"
                points={points}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />

              {/* Dots */}
              {weightData.map((d, idx) => {
                const innerWidth =
                  chartWidth - paddingLeft - paddingRight;
                const innerHeight =
                  chartHeight - paddingTop - paddingBottom;
                const x =
                  paddingLeft +
                  (weightData.length === 1
                    ? innerWidth / 2
                    : (innerWidth * idx) /
                      (weightData.length - 1));
                const normalized =
                  (d.value - minWeight) /
                  (maxWeight - minWeight);
                const y =
                  paddingTop + (1 - normalized) * innerHeight;

                return (
                  <g key={d.date}>
                    <motion.circle
                      cx={x}
                      cy={y}
                      r={3}
                      fill="#111827"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 + idx * 0.1 }}
                    />
                  </g>
                );
              })}

              {/* X labels */}
              {weightData.map((d, idx) => {
                const innerWidth =
                  chartWidth - paddingLeft - paddingRight;
                const x =
                  paddingLeft +
                  (weightData.length === 1
                    ? innerWidth / 2
                    : (innerWidth * idx) /
                      (weightData.length - 1));
                const y = chartHeight - paddingBottom + 16;
                return (
                  <text
                    key={d.date}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#9CA3AF"
                  >
                    {d.label}
                  </text>
                );
              })}
            </svg>
          </motion.div>
        )}
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
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
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

      {/* Log Form */}
      <motion.div 
        className="rounded-2xl border border-gray-200 bg-white p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.005 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Log Daily Progress
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Track your metrics for better insights
            </p>
          </div>
          <motion.div 
            className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center"
            animate={{ 
              rotate: [0, 360],
              transition: { 
                duration: 20,
                repeat: Infinity,
                ease: "linear" 
              }
            }}
          >
            <svg
              className="h-5 w-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </motion.div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div 
              className="space-y-2"
              whileHover={{ y: -2 }}
            >
              <label className="text-sm font-medium text-gray-700">
                Date
              </label>
              <motion.input
                name="date"
                type="date"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                value={form.date}
                onChange={handleChange}
                required
                whileFocus={{ scale: 1.02 }}
              />
            </motion.div>

            <motion.div 
              className="space-y-2"
              whileHover={{ y: -2 }}
            >
              <label className="text-sm font-medium text-gray-700">
                Weight (kg)
              </label>
              <div className="relative">
                <motion.input
                  name="weightKg"
                  type="number"
                  step="0.1"
                  placeholder="75.5"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                  value={form.weightKg}
                  onChange={handleChange}
                  whileFocus={{ scale: 1.02 }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  kg
                </span>
              </div>
            </motion.div>

            <motion.div 
              className="space-y-2"
              whileHover={{ y: -2 }}
            >
              <label className="text-sm font-medium text-gray-700">
                Meals Followed (%)
              </label>
              <div className="relative">
                <motion.input
                  name="mealsFollowedPercent"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="85"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                  value={form.mealsFollowedPercent}
                  onChange={handleChange}
                  whileFocus={{ scale: 1.02 }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  %
                </span>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-3 p-2 rounded-xl border border-gray-300 bg-gray-50">
                <div className="relative">
                  <input
                    id="workoutCompleted"
                    name="workoutCompleted"
                    type="checkbox"
                    checked={form.workoutCompleted}
                    onChange={handleChange}
                    className="h-5 w-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                </div>
                <label
                  htmlFor="workoutCompleted"
                  className="text-sm font-medium text-gray-700"
                >
                  Workout Completed
                </label>
              </div>
            </motion.div>
          </div>

          <motion.div 
            className="space-y-2"
            whileHover={{ y: -2 }}
          >
            <label className="text-sm font-medium text-gray-700">
              Notes & Reflection
            </label>
            <motion.textarea
              name="notes"
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
              value={form.notes}
              onChange={handleChange}
              placeholder="How did you feel today? Any achievements or challenges?"
              whileFocus={{ scale: 1.02 }}
            />
          </motion.div>

          <div className="flex justify-end">
            <motion.button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-gray-900 hover:bg-black text-white font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {saving ? (
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
                  Saving...
                </span>
              ) : (
                "Save Daily Log"
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* History Section */}
      <motion.div 
        className="rounded-2xl border border-gray-200 bg-white p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Progress History
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Track your journey over time
            </p>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                viewMode === "table"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Table
            </motion.button>
            <motion.button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                viewMode === "cards"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cards
            </motion.button>
          </div>
        </div>

        {loadingList ? (
          <motion.div 
            className="py-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-gray-300 border-t-gray-900"></div>
            <p className="mt-3 text-sm text-gray-500">
              Loading your progress history...
            </p>
          </motion.div>
        ) : list.length === 0 ? (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No Logs Yet
            </h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
              Start tracking your progress by logging today&apos;s metrics
              above
            </p>
          </motion.div>
        ) : viewMode === "table" ? (
          <motion.div 
            className="overflow-hidden rounded-xl border border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 border-b border-gray-200">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 border-b border-gray-200">
                    Weight
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 border-b border-gray-200">
                    Workout
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 border-b border-gray-200">
                    Meals
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 border-b border-gray-200">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedList.map((item, index) => (
                  <motion.tr
                    key={item._id}
                    className="hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {item.weightKg ? (
                        <span className="font-medium text-gray-900">
                          {item.weightKg}{" "}
                          <span className="text-gray-500">kg</span>
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.workoutCompleted ? (
                        <motion.span 
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                          whileHover={{ scale: 1.1 }}
                        >
                          <svg
                            className="h-3 w-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Completed
                        </motion.span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <svg
                            className="h-3 w-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Skipped
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.mealsFollowedPercent ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <motion.div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${item.mealsFollowedPercent}%`,
                              }}
                              initial={{ width: 0 }}
                              animate={{ width: `${item.mealsFollowedPercent}%` }}
                              transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                            />
                          </div>
                          <span className="font-medium text-gray-900">
                            {item.mealsFollowedPercent}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs">
                      <div className="truncate" title={item.notes}>
                        {item.notes || (
                          <span className="text-gray-400">No notes</span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        ) : (
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
              hidden: {}
            }}
          >
            {sortedList.map((item, index) => (
              <motion.div
                key={item._id}
                className="rounded-xl border border-gray-200 bg-white p-4 hover:border-gray-300 transition-colors"
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  visible: { opacity: 1, scale: 1 }
                }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(item.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {item.workoutCompleted && (
                    <motion.span 
                      className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        transition: { 
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 2 
                        }
                      }}
                    >
                      <svg
                        className="h-3 w-3 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.span>
                  )}
                </div>

                <div className="space-y-3">
                  {item.weightKg && (
                    <motion.div 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <span className="text-sm text-gray-500">Weight</span>
                      <span className="text-sm font-medium text-gray-900">
                        {item.weightKg} kg
                      </span>
                    </motion.div>
                  )}

                  {item.mealsFollowedPercent && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-500">
                          Meals Followed
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {item.mealsFollowedPercent}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <motion.div
                          className="bg-green-600 h-1.5 rounded-full"
                          style={{
                            width: `${item.mealsFollowedPercent}%`,
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.mealsFollowedPercent}%` }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {item.notes && (
                    <motion.div 
                      className="pt-2 border-t border-gray-100"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                    >
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {item.notes}
                      </p>
                    </motion.div>
                  )}
                  {!item.notes &&
                    !item.weightKg &&
                    !item.mealsFollowedPercent && (
                      <p className="text-xs text-gray-400">
                        No extra details logged for this day.
                      </p>
                    )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ProgressPage;