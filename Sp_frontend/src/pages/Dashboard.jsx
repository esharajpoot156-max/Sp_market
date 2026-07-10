import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../services/api";
import SpotlightCard from "../components/SpotlightCard";

const StatCard = ({ label, value, prefix = "" }) => (
  <SpotlightCard className="bg-white p-5">
    <p className="text-xs text-secondary/50 uppercase tracking-wide mb-1">{label}</p>
    <p className="text-2xl font-bold text-secondary">
      {prefix}
      {value}
    </p>
  </SpotlightCard>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [receivedBookings, setReceivedBookings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [statsRes, receivedRes, myRes] = await Promise.all([
        api.get("/dashboard"),
        api.get("/bookings/received"),
        api.get("/bookings/my-bookings"),
      ]);
      setStats(statsRes.data);
      setReceivedBookings(receivedRes.data);
      setMyBookings(myRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      toast.success(`Booking ${status}`);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update booking");
    }
  };

  if (loading) return <p className="text-center py-16 text-secondary/50">Loading dashboard...</p>;

  return (
    <div className="bg-bg min-h-[calc(100vh-72px)] px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-secondary mb-6">Your Dashboard</h1>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          <StatCard label="Total Earnings" value={stats.earnings.total.toLocaleString()} prefix="Rs. " />
          <StatCard label="Products Listed" value={stats.listings.totalProducts} />
          <StatCard label="Services Listed" value={stats.listings.totalServices} />
          <StatCard label="Avg Rating" value={stats.rating.average || "—"} />
        </motion.div>

        {/* Received bookings (as provider) */}
        <h2 className="text-lg font-bold text-secondary mb-3">Booking Requests Received</h2>
        {receivedBookings.length === 0 ? (
          <p className="text-secondary/50 text-sm mb-8">No booking requests yet.</p>
        ) : (
          <div className="space-y-3 mb-10">
            {receivedBookings.map((b) => (
              <div
                key={b._id}
                className="bg-white rounded-xl border border-secondary/10 p-4 flex items-center justify-between flex-wrap gap-3"
              >
                <div>
                  <p className="font-medium text-secondary">{b.serviceId?.title}</p>
                  <p className="text-xs text-secondary/50">
                    {b.customerId?.name} • {new Date(b.date).toLocaleDateString()} at {b.time}
                  </p>
                  <span
                    className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full capitalize ${
                      b.status === "pending"
                        ? "bg-accent/40 text-secondary"
                        : b.status === "accepted"
                        ? "bg-primary/10 text-primary"
                        : b.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-secondary/10 text-secondary/60"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <div className="flex gap-2">
                  {b.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(b._id, "accepted")}
                        className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateStatus(b._id, "rejected")}
                        className="text-xs border border-secondary/20 text-secondary px-3 py-1.5 rounded-lg hover:bg-secondary/5"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {b.status === "accepted" && (
                    <button
                      onClick={() => updateStatus(b._id, "completed")}
                      className="text-xs bg-secondary text-white px-3 py-1.5 rounded-lg hover:bg-secondary/80"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* My bookings (as customer) */}
        <h2 className="text-lg font-bold text-secondary mb-3">Your Bookings</h2>
        {myBookings.length === 0 ? (
          <p className="text-secondary/50 text-sm">You haven't booked any services yet.</p>
        ) : (
          <div className="space-y-3">
            {myBookings.map((b) => (
              <div
                key={b._id}
                className="bg-white rounded-xl border border-secondary/10 p-4 flex items-center justify-between flex-wrap gap-3"
              >
                <div>
                  <p className="font-medium text-secondary">{b.serviceId?.title}</p>
                  <p className="text-xs text-secondary/50">
                    with {b.providerId?.name} • {new Date(b.date).toLocaleDateString()} at {b.time}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                    b.status === "pending"
                      ? "bg-accent/40 text-secondary"
                      : b.status === "accepted"
                      ? "bg-primary/10 text-primary"
                      : b.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-secondary/10 text-secondary/60"
                  }`}
                >
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;