import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/register", formData);
      setRegistered(true);
      toast.success("Account created! Please verify your email.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-bg dark:bg-ink px-4 transition-colors">
        <div className="w-full max-w-md bg-surface dark:bg-secondary/60 rounded-2xl shadow-sm border border-secondary/10 dark:border-white/10 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-2xl">
            ✉️
          </div>
          <h1 className="text-xl font-bold text-secondary dark:text-white mb-2">Verify your email</h1>
          <p className="text-sm text-secondary/60 dark:text-white/50 mb-6">
            We've sent a verification link to <span className="font-medium">{formData.email}</span>.
            Please check your inbox and verify before logging in.
          </p>
          <Link
            to="/login"
            className="inline-block bg-primary hover:bg-primary-dark text-white font-medium px-6 py-2.5 rounded-lg transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-bg dark:bg-ink px-4 transition-colors">
      <div className="w-full max-w-md bg-surface dark:bg-secondary/60 rounded-2xl shadow-sm border border-secondary/10 dark:border-white/10 p-8">
        <h1 className="text-2xl font-bold text-secondary dark:text-white mb-1">Create your account</h1>
        <p className="text-sm text-secondary/60 dark:text-white/50 mb-6">Join your local marketplace</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary dark:text-white/80 mb-1">Full name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 dark:border-white/20 dark:bg-secondary/40 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Ali Khan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary dark:text-white/80 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 dark:border-white/20 dark:bg-secondary/40 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary dark:text-white/80 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 dark:border-white/20 dark:bg-secondary/40 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-secondary/60 dark:text-white/50 mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;