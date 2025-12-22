import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    age: "",
    gender: "male",
    heightCm: "",
    weightKg: "",
    activityLevel: "moderate",
    goal: "fat_loss",
    dietType: "veg",
    allergies: "",
    wakeTime: "07:00",
    sleepTime: "23:00",
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Plain JSX (no TypeScript generics)
  const [phase, setPhase] = useState("form");
  const [aiStep, setAiStep] = useState(0);

  const aiSteps = [
    "Analyzing your body metrics and lifestyle…",
    "Calculating ideal calories, macros, and training load…",
    "Configuring your personalized dashboard and recommendations…",
  ];

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile/me");
        if (res.data) {
          // defensive: only join if allergies is an array
          const allergiesField = Array.isArray(res.data.allergies)
            ? res.data.allergies.join(", ")
            : (res.data.allergies ?? "");

          setForm((prev) => ({
            ...prev,
            ...res.data,
            allergies: allergiesField,
          }));
        }
      } catch (err) {
        // ignore errors fetching profile
      } finally {
        setInitialLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        age: form.age ? Number(form.age) : undefined,
        heightCm: form.heightCm ? Number(form.heightCm) : undefined,
        weightKg: form.weightKg ? Number(form.weightKg) : undefined,
        allergies: form.allergies
          ? form.allergies
              .split(",")
              .map((a) => a.trim())
              .filter(Boolean)
          : [],
      };

      await api.put("/profile", payload);

      // switch to AI loading phase instead of direct navigate
      setLoading(false);
      setPhase("ai");
      setAiStep(0);

      let current = 0;
      const stepDuration = 900; // ms between AI text changes

      const runSequence = () => {
        current += 1;
        if (current < aiSteps.length) {
          setAiStep(current);
          setTimeout(runSequence, stepDuration);
        } else {
          navigate("/dashboard");
        }
      };

      setTimeout(runSequence, stepDuration);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile");
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (step < totalSteps) {
      setStep((s) => s + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  const isDisabled = loading || phase === "ai";

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-[3px] border-gray-300 border-t-gray-900"></div>
          <p className="mt-4 text-sm text-gray-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-50 to-white">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-gray-900 to-black mb-4 shadow-sm">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Personalize Your Fitness Journey
          </h1>
          <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
            Help our AI understand you better to create the perfect workout and
            nutrition plan
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-900 transition-all duration-300"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <div
              className={`text-center ${step >= 1 ? "text-gray-900" : "text-gray-400"}`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  step >= 1 ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                1
              </div>
              <p className="text-xs font-medium">Basic Info</p>
            </div>
            <div
              className={`text-center ${step >= 2 ? "text-gray-900" : "text-gray-400"}`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  step >= 2 ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
              <p className="text-xs font-medium">Lifestyle</p>
            </div>
            <div
              className={`text-center ${step >= 3 ? "text-gray-900" : "text-gray-400"}`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  step >= 3 ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                3
              </div>
              <p className="text-xs font-medium">Goals</p>
            </div>
          </div>
        </div>

        {/* Onboarding Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {error && phase === "form" && (
            <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-800 backdrop-blur-sm mb-6">
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
            </div>
          )}

          {phase === "form" ? (
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Basic Information
                    </h2>
                    <p className="text-sm text-gray-500">Tell us about yourself</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Age</label>
                      <div className="relative">
                        <input
                          name="age"
                          type="number"
                          placeholder="Enter your age"
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                          value={form.age}
                          onChange={handleChange}
                          required
                          disabled={isDisabled}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">years</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Gender</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["male", "female", "other"].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, gender: option }))}
                            disabled={isDisabled}
                            className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                              form.gender === option
                                ? "border-gray-900 bg-gray-900 text-white"
                                : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                            } ${isDisabled ? "opacity-70 cursor-not-allowed" : ""}`}
                          >
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Height (cm)</label>
                      <div className="relative">
                        <input
                          name="heightCm"
                          type="number"
                          placeholder="Enter height"
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                          value={form.heightCm}
                          onChange={handleChange}
                          required
                          disabled={isDisabled}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">cm</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Weight (kg)</label>
                      <div className="relative">
                        <input
                          name="weightKg"
                          type="number"
                          placeholder="Enter weight"
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                          value={form.weightKg}
                          onChange={handleChange}
                          required
                          disabled={isDisabled}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">kg</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Lifestyle */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Lifestyle & Schedule</h2>
                    <p className="text-sm text-gray-500">Help us understand your daily routine</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Activity Level</label>
                      <div className="space-y-2">
                        {[
                          { value: "sedentary", label: "Sedentary", desc: "Little to no exercise" },
                          { value: "light", label: "Light", desc: "Light exercise 1-3 days/week" },
                          { value: "moderate", label: "Moderate", desc: "Moderate exercise 3-5 days/week" },
                          { value: "high", label: "High", desc: "Intense exercise 6-7 days/week" },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, activityLevel: option.value }))}
                            disabled={isDisabled}
                            className={`w-full p-4 rounded-xl border text-left transition-all ${
                              form.activityLevel === option.value ? "border-gray-900 bg-gray-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                            } ${isDisabled ? "opacity-70 cursor-not-allowed" : ""}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`font-medium ${form.activityLevel === option.value ? "text-gray-900" : "text-gray-700"}`}>
                                {option.label}
                              </span>
                              {form.activityLevel === option.value && (
                                <svg className="h-5 w-5 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{option.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Sleep Schedule</label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Wake Up Time</label>
                            <div className="relative">
                              <input
                                name="wakeTime"
                                type="time"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                                value={form.wakeTime}
                                onChange={handleChange}
                                disabled={isDisabled}
                              />
                              <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Sleep Time</label>
                            <div className="relative">
                              <input
                                name="sleepTime"
                                type="time"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                                value={form.sleepTime}
                                onChange={handleChange}
                                disabled={isDisabled}
                              />
                              <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Dietary Preferences</label>
                        <div className="grid grid-cols-2 gap-2">
                          {["veg", "non-veg", "egg", "vegan"].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => setForm((prev) => ({ ...prev, dietType: option }))}
                              disabled={isDisabled}
                              className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                                form.dietType === option ? "border-green-600 bg-green-50 text-green-700" : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                              } ${isDisabled ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Allergies (Optional)</label>
                        <input
                          name="allergies"
                          type="text"
                          placeholder="e.g., peanuts, lactose, gluten"
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                          value={form.allergies}
                          onChange={handleChange}
                          disabled={isDisabled}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Goals */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Fitness Goals</h2>
                    <p className="text-sm text-gray-500">What do you want to achieve?</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        { value: "fat_loss", label: "Fat Loss", icon: "🔥", desc: "Burn fat and lose weight" },
                        { value: "muscle_gain", label: "Muscle Gain", icon: "💪", desc: "Build strength and muscle" },
                        { value: "maintain", label: "Maintain", icon: "⚖️", desc: "Stay fit and healthy" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, goal: option.value }))}
                          disabled={isDisabled}
                          className={`p-6 rounded-2xl border-2 transition-all transform hover:scale-[1.02] ${
                            form.goal === option.value ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 hover:border-gray-300"
                          } ${isDisabled ? "opacity-70 cursor-not-allowed" : ""}`}
                        >
                          <div className="text-2xl mb-3">{option.icon}</div>
                          <h3 className="font-semibold text-lg mb-1">{option.label}</h3>
                          <p className={`text-sm ${form.goal === option.value ? "text-gray-200" : "text-gray-500"}`}>{option.desc}</p>
                        </button>
                      ))}
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mt-6">
                      <div className="flex items-start gap-3">
                        <svg className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-700">Based on your profile, our AI will generate a personalized plan including:</p>
                          <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>Customized workout routines</li>
                            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>Personalized meal plans</li>
                            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>Progress tracking schedule</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-10 flex justify-between">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={step === 1 || isDisabled}
                  className={`px-6 py-3 rounded-xl border font-medium transition-colors ${
                    step === 1 || isDisabled ? "border-gray-300 text-gray-400 cursor-not-allowed" : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  Back
                </button>

                {step < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={isDisabled}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-gray-900 to-black text-white font-medium hover:from-black hover:to-gray-900 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Step
                    <svg className="inline-block ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isDisabled}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-gray-900 to-black text-white font-medium hover:from-black hover:to-gray-900 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Your Plan...
                      </span>
                    ) : (
                      <>
                        Complete Setup
                        <svg className="inline-block ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          ) : (
            // AI Phase after submit
            <div className="py-10 space-y-5">
              <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full border-2 border-gray-900 border-t-transparent animate-spin" />
                <p className="text-sm font-semibold text-gray-900">{aiSteps[aiStep]}</p>
                <p className="text-xs text-gray-500 text-center max-w-sm">
                  We&apos;re using your age, body metrics, lifestyle, and goals to build a tailored plan. Your dashboard will be ready in just a moment.
                </p>
              </div>

              <div className="flex justify-center gap-2 mt-2">
                {aiSteps.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1.5 w-6 rounded-full transition-all ${idx <= aiStep ? "bg-gray-900" : "bg-gray-200"}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Security Note */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Your information is secure and will only be used to personalize your fitness experience.
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
