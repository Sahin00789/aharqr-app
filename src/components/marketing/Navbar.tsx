import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore"; 

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

// Helper to determine the correct route based on the user's role
const getDashboardRoute = (role?: string) => {
  switch (role) {
    case "RESTAURANT_ADMIN":
      return "/admin/dashboard";
    case "CAPTAIN":
      return "/captain/floor-plan";
    case "CHEF":
      return "/chef/kitchen-display";
    case "CUSTOMER":
      return "/customer/menu";
    case "PLATFORM_ADMIN":
      return "/platform/dashboard";
    default:
      return "/dashboard"; // Fallback
  }
};

export default function Navbar() {
  // Grab both the authentication status AND the user object from Zustand
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  // Calculate the target route dynamically
  const dashboardRoute = getDashboardRoute(user?.role);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-black text-white shadow-lg shadow-indigo-600/20">
            AQ
          </div>

          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              AharQR
            </h1>
            <p className="-mt-1 text-xs text-slate-500">
              Restaurant Operating System
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-10 lg:flex">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Side Auth Buttons */}
        <div className="flex items-center gap-2 md:gap-4">
          {isAuthenticated ? (
            /* --- LOGGED IN: Show Dashboard Only (All Devices) --- */
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                to={dashboardRoute}
                className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
              >
                Dashboard
              </Link>
            </motion.div>
          ) : (
            /* --- LOGGED OUT: Responsive Sign In & Register --- */
            <>
              {/* Sign In Button (Shows on both Mobile and Desktop) */}
              <Link
                to="/login"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Sign In
              </Link>

              {/* Register Button (Hidden on Mobile, Shows on Desktop) */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="hidden md:block" 
              >
                <Link
                  to="/register"
                  className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
                >
                  Start Free Trial
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}