import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import {
  FaSearch, FaBell, FaUserCircle, FaSignOutAlt, FaComments, FaPlus,
  FaMoon, FaSun, FaBox, FaTools,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const TiltButton = ({ children, className = "", onClick, to }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-15, 15], [10, -10]);
  const rotateY = useTransform(x, [-15, 15], [-10, 10]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      style={{ rotateX, rotateY, perspective: 400 }}
      whileTap={{ scale: 0.95 }}
      className="inline-block relative"
    >
      {to ? (
        <Link to={to} onClick={onClick} className={className}>{children}</Link>
      ) : (
        <button onClick={onClick} className={className}>{children}</button>
      )}
    </motion.div>
  );
};

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={`relative text-sm font-medium px-1 py-1 transition-colors ${
        active ? "text-primary" : "text-secondary/60 hover:text-secondary dark:text-white/60 dark:hover:text-white"
      }`}
    >
      {children}
      {active && (
        <motion.div
          layoutId="navUnderline"
          className="absolute -bottom-1 left-0 right-0 h-[2px] bg-primary rounded-full"
        />
      )}
    </Link>
  );
};

const IconButton = ({ to, onClick, children, badge }) => {
  const Wrapper = to ? Link : "button";
  return (
    <Wrapper
      to={to}
      onClick={onClick}
      className="relative w-9 h-9 flex items-center justify-center rounded-full border border-secondary/10 dark:border-white/10 bg-white dark:bg-secondary/60 text-secondary/60 dark:text-white/70 hover:text-primary hover:border-primary/30 hover:shadow-[0_2px_10px_rgba(232,41,28,0.15)] transition-all"
    >
      {children}
      {badge && (
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white dark:border-secondary" />
      )}
    </Wrapper>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchText.trim()) return;
    navigate(`/products?search=${encodeURIComponent(searchText)}`);
    setSearchOpen(false);
    setSearchText("");
  };

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-secondary/90 border-b border-secondary/10 dark:border-white/10 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-1 flex-shrink-0">
          <span className="text-xl font-extrabold text-secondary dark:text-white tracking-tight">
            Sp<span className="text-primary">.market</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          <NavLink to="/">Products</NavLink>
          <NavLink to="/services">Services</NavLink>
          {user && <NavLink to="/dashboard">Dashboard</NavLink>}
          {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex items-center">
            <AnimatePresence>
              {searchOpen && (
                <motion.form
                  onSubmit={handleSearch}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden mr-2"
                >
                  <input
                    autoFocus
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onBlur={() => !searchText && setSearchOpen(false)}
                    placeholder="Search products..."
                    className="w-full px-3 py-1.5 rounded-full border border-secondary/20 dark:border-white/20 dark:bg-secondary/40 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </motion.form>
              )}
            </AnimatePresence>
            <button
              onClick={() => setSearchOpen((s) => !s)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-secondary/10 dark:border-white/10 bg-white dark:bg-secondary/60 text-secondary/60 dark:text-white/70 hover:text-primary hover:border-primary/30 transition-all"
            >
              <FaSearch size={14} />
            </button>
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-secondary/10 dark:border-white/10 bg-white dark:bg-secondary/60 text-secondary/60 dark:text-accent hover:text-primary transition-all"
          >
            {dark ? <FaSun size={14} /> : <FaMoon size={14} />}
          </button>

          {user ? (
            <>
              {/* Create dropdown */}
              <div className="relative hidden sm:block">
                <TiltButton
                  onClick={() => setCreateOpen((s) => !s)}
                  className="flex items-center gap-1.5 text-sm font-semibold bg-secondary text-white px-4 py-2 rounded-full border border-secondary shadow-[0_2px_0_rgba(0,0,0,0.15),0_4px_10px_rgba(20,20,31,0.25)] hover:shadow-[0_1px_0_rgba(0,0,0,0.15),0_2px_6px_rgba(20,20,31,0.25)] hover:translate-y-[1px] transition-all"
                >
                  <FaPlus size={11} /> Create
                </TiltButton>

                <AnimatePresence>
                  {createOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-white dark:bg-secondary border border-secondary/10 dark:border-white/10 rounded-xl shadow-lg overflow-hidden z-50"
                    >
                      <Link
                        to="/products/new"
                        onClick={() => setCreateOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-secondary dark:text-white hover:bg-primary/5 transition"
                      >
                        <FaBox className="text-primary" size={14} /> Sell a Product
                      </Link>
                      <Link
                        to="/services/new"
                        onClick={() => setCreateOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-secondary dark:text-white hover:bg-primary/5 transition border-t border-secondary/10 dark:border-white/10"
                      >
                        <FaTools className="text-primary" size={14} /> Offer a Service
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="hidden sm:block w-px h-6 bg-secondary/10 dark:bg-white/10" />

              <IconButton to="/messages"><FaComments size={15} /></IconButton>
              <IconButton to="/notifications" badge><FaBell size={15} /></IconButton>
              <IconButton to="/profile"><FaUserCircle size={17} /></IconButton>

              <button
                onClick={handleLogout}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-secondary/10 dark:border-white/10 bg-white dark:bg-secondary/60 text-secondary/50 dark:text-white/60 hover:text-primary transition-all"
                title="Logout"
              >
                <FaSignOutAlt size={14} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-secondary/70 dark:text-white/70 hover:text-secondary dark:hover:text-white px-3 py-2 transition-colors">
                Log In
              </Link>
              <TiltButton
                to="/register"
                className="text-sm font-semibold bg-primary text-white px-5 py-2 rounded-full border border-primary-dark shadow-[0_2px_0_rgba(0,0,0,0.15),0_4px_12px_rgba(232,41,28,0.35)] hover:shadow-[0_1px_0_rgba(0,0,0,0.15),0_2px_8px_rgba(232,41,28,0.35)] hover:translate-y-[1px] transition-all"
              >
                Sign Up
              </TiltButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;