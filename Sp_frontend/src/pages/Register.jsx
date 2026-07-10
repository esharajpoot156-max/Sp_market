import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/register", formData);
      login(res.data);
      toast.success("Account created! Check your email to verify.");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const isValidEmailFormat = (email) => {
  return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email) && 
         !["test.com", "example.com", "fake.com"].some(d => email.endsWith(d));};



  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-secondary/10 p-8">
        <h1 className="text-2xl font-bold text-secondary mb-1">Create your account</h1>
        <p className="text-sm text-secondary/60 mb-6">Join your local marketplace</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Full name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Ali Khan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
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

        <p className="text-sm text-secondary/60 mt-6 text-center">
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