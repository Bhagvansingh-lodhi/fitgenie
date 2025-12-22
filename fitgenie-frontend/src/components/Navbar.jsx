import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="border-b border-gray-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 hover:bg-white/95"
    >
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">

        {/* Logo / Brand */}
        <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>

              <div className="relative h-9 w-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#05060a] via-[#050713] to-black shadow-sm">
                <div className="relative h-[3px] w-7 bg-white/90 rounded-full rotate-[-32deg]">
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-md bg-[#05060a] border border-white/90 shadow-[0_0_4px_rgba(255,255,255,0.5)]" />
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="font-bold text-xl text-gray-900 tracking-tight">
                FitGenie
              </span>
              <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">
                AI Fitness Assistant
              </span>
            </div>
          </Link>
        </motion.div>

        {/* Navigation Links */}
        <div className="flex items-center gap-8">
          {isAuthenticated && (
            <>
              {["dashboard", "plan", "progress"].map((item) => (
                <motion.div
                  key={item}
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <Link
                    to={`/${item}`}
                    className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </Link>

                  {/* Animated underline */}
                  <motion.span
                    layoutId="underline"
                    className="absolute left-0 -bottom-1 h-0.5 w-full bg-gray-900"
                    initial={{ opacity: 0, width: 0 }}
                    whileHover={{ opacity: 1, width: "100%" }}
                    transition={{ duration: 0.25 }}
                  />
                </motion.div>
              ))}
            </>
          )}

          {/* Auth Buttons */}
          {!isAuthenticated ? (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <motion.div whileHover={{ scale: 1.07 }}>
                <Link
                  to="/login"
                  className="text-sm px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-medium hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                >
                  Login
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.07 }}>
                <Link
                  to="/register"
                  className="text-sm px-4 py-2 rounded-xl bg-gradient-to-r from-gray-900 to-black text-white font-medium hover:from-black hover:to-gray-900 hover:shadow-sm transition-all duration-200"
                >
                  Get Started
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <div className="flex items-center gap-4">
              
              {/* User Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200"
              >
                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center text-xs text-white font-medium">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {user?.name || "User"}
                </span>
              </motion.div>

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.05, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
