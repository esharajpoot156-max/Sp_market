import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-bg dark:bg-ink px-4 transition-colors">
      <div className="w-full max-w-md bg-surface dark:bg-secondary/60 rounded-2xl shadow-sm border border-secondary/10 dark:border-white/10 p-8">
        {!sent ? (
          <>
            <h1 className="text-2xl font-bold text-secondary dark:text-white mb-1">Forgot password?</h1>
            <p className="text-sm text-secondary/60 dark:text-white/50 mb-6">
              Enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary dark:text-white/80 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 dark:border-white/20 dark:bg-secondary/40 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-2xl">
              ✓
            </div>
            <h1 className="text-xl font-bold text-secondary dark:text-white mb-2">Check your email</h1>
            <p className="text-sm text-secondary/60 dark:text-white/50">
              If an account exists for {email}, a reset link has been sent.
            </p>
          </div>
        )}

        <p className="text-sm text-secondary/60 dark:text-white/50 mt-6 text-center">
          <Link to="/login" className="text-primary font-medium hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;