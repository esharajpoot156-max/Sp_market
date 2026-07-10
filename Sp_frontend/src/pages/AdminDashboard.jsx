import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../services/api";
import SpotlightCard from "../components/SpotlightCard";

const StatCard = ({ label, value }) => (
  <SpotlightCard className="bg-white p-5">
    <p className="text-xs text-secondary/50 uppercase tracking-wide mb-1">{label}</p>
    <p className="text-2xl font-bold text-secondary">{value}</p>
  </SpotlightCard>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState({ pendingProducts: [], pendingServices: [] });
  const [reports, setReports] = useState([]);
  const [tab, setTab] = useState("listings");
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [statsRes, pendingRes, reportsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/listings/pending"),
        api.get("/admin/reports"),
      ]);
      setStats(statsRes.data);
      setPending(pendingRes.data);
      setReports(reportsRes.data);
    } catch (err) {
      toast.error("Admin access required");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleApprove = async (type, id) => {
    try {
      await api.put(`/admin/listings/${type}/${id}/approve`);
      toast.success(`${type} approved`);
      fetchAll();
    } catch (err) {
      toast.error("Failed to approve");
    }
  };

  const handleReject = async (type, id) => {
    try {
      await api.put(`/admin/listings/${type}/${id}/reject`);
      toast.success(`${type} rejected`);
      fetchAll();
    } catch (err) {
      toast.error("Failed to reject");
    }
  };

  const handleReportAction = async (id, status) => {
    try {
      await api.put(`/admin/reports/${id}`, { status });
      toast.success(`Report ${status}`);
      fetchAll();
    } catch (err) {
      toast.error("Failed to update report");
    }
  };

  if (loading) return <p className="text-center py-16 text-secondary/50">Loading admin panel...</p>;
  if (!stats) return <p className="text-center py-16 text-secondary/50">Not authorized.</p>;

  return (
    <div className="bg-bg min-h-[calc(100vh-72px)] px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-secondary mb-6">Admin Panel</h1>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10"
        >
          <StatCard label="Total Users" value={stats.totalUsers} />
          <StatCard label="Products" value={stats.totalProducts} />
          <StatCard label="Services" value={stats.totalServices} />
          <StatCard label="Bookings" value={stats.totalBookings} />
          <StatCard label="Pending Reports" value={stats.pendingReports} />
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-secondary/10">
          {["listings", "reports"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition ${
                tab === t ? "border-primary text-primary" : "border-transparent text-secondary/50"
              }`}
            >
              {t === "listings" ? "Pending Listings" : "Reported Content"}
            </button>
          ))}
        </div>

        {tab === "listings" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-bold text-secondary mb-3">Pending Products</h2>
              {pending.pendingProducts.length === 0 ? (
                <p className="text-secondary/50 text-sm">No pending products.</p>
              ) : (
                <div className="space-y-3">
                  {pending.pendingProducts.map((p) => (
                    <div
                      key={p._id}
                      className="bg-white rounded-xl border border-secondary/10 p-4 flex items-center justify-between flex-wrap gap-3"
                    >
                      <div className="flex items-center gap-3">
                        {p.images?.[0] && (
                          <img src={p.images[0]} className="w-12 h-12 rounded-lg object-cover" alt="" />
                        )}
                        <div>
                          <p className="font-medium text-secondary text-sm">{p.title}</p>
                          <p className="text-xs text-secondary/50">
                            by {p.sellerId?.name} • Rs. {p.price?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove("product", p._id)}
                          className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject("product", p._id)}
                          className="text-xs border border-secondary/20 text-secondary px-3 py-1.5 rounded-lg hover:bg-secondary/5"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-bold text-secondary mb-3">Pending Services</h2>
              {pending.pendingServices.length === 0 ? (
                <p className="text-secondary/50 text-sm">No pending services.</p>
              ) : (
                <div className="space-y-3">
                  {pending.pendingServices.map((s) => (
                    <div
                      key={s._id}
                      className="bg-white rounded-xl border border-secondary/10 p-4 flex items-center justify-between flex-wrap gap-3"
                    >
                      <div className="flex items-center gap-3">
                        {s.portfolioImages?.[0] && (
                          <img src={s.portfolioImages[0]} className="w-12 h-12 rounded-lg object-cover" alt="" />
                        )}
                        <div>
                          <p className="font-medium text-secondary text-sm">{s.title}</p>
                          <p className="text-xs text-secondary/50">
                            by {s.providerId?.name} • Rs. {s.price?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove("service", s._id)}
                          className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject("service", s._id)}
                          className="text-xs border border-secondary/20 text-secondary px-3 py-1.5 rounded-lg hover:bg-secondary/5"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "reports" && (
          <div className="space-y-3">
            {reports.length === 0 ? (
              <p className="text-secondary/50 text-sm">No reports.</p>
            ) : (
              reports.map((r) => (
                <div key={r._id} className="bg-white rounded-xl border border-secondary/10 p-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="font-medium text-secondary text-sm capitalize">
                        {r.targetType} reported — {r.reason}
                      </p>
                      <p className="text-xs text-secondary/50">
                        by {r.reporterId?.name} • {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                      {r.description && (
                        <p className="text-sm text-secondary/70 mt-1">{r.description}</p>
                      )}
                    </div>
                    {r.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReportAction(r._id, "reviewed")}
                          className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark"
                        >
                          Mark Reviewed
                        </button>
                        <button
                          onClick={() => handleReportAction(r._id, "dismissed")}
                          className="text-xs border border-secondary/20 text-secondary px-3 py-1.5 rounded-lg hover:bg-secondary/5"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                    {r.status !== "pending" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary/60 capitalize">
                        {r.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;