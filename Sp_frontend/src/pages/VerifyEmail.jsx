import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-email/${token}`);
        setStatus("success");
        setMessage(res.data.message);
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed");
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-secondary/10 p-8 text-center">
        {status === "loading" && (
          <p className="text-secondary/70">Verifying your email...</p>
        )}

        {status === "success" && (
          <>
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-2xl">
              ✓
            </div>
            <h1 className="text-xl font-bold text-secondary mb-2">Email verified</h1>
            <p className="text-sm text-secondary/60 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block bg-primary hover:bg-primary-dark text-white font-medium px-6 py-2.5 rounded-lg transition"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-14 h-14 rounded-full bg-red-50 text-primary flex items-center justify-center mx-auto mb-4 text-2xl">
              ✕
            </div>
            <h1 className="text-xl font-bold text-secondary mb-2">Verification failed</h1>
            <p className="text-sm text-secondary/60 mb-6">{message}</p>
            <Link to="/" className="text-primary hover:underline text-sm">
              Back to home
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;