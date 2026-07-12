import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../services/api";
import SpotlightCard from "../components/SpotlightCard";

const StatCard = ({ label, value, prefix = "" }) => (
  <SpotlightCard className="bg-surface dark:bg-secondary/60 p-5">
    <p className="text-xs text-secondary/50 dark:text-white/40 uppercase tracking-wide mb-1">{label}</p>
    <p className="text-2xl font-bold text-secondary dark:text-white">
      {prefix}
      {value}
    </p>
  </SpotlightCard>
);

const statusStyle = (status) => {
  switch (status) {
    case "pending": return "bg-accent/40 text-secondary dark:bg-primary/15 dark:text-accent";
    case "accepted":
    case "confirmed": return "bg-primary/10 text-primary";
    case "shipped": return "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300";
    case "completed":
    case "delivered": return "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300";
    default: return "bg-secondary/10 text-secondary/60 dark:bg-white/10 dark:text-white/50";
  }
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [receivedBookings, setReceivedBookings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [receivedOrders, setReceivedOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [statsRes, receivedRes, myRes, recvOrdersRes, myOrdersRes] = await Promise.all([
        api.get("/dashboard"),
        api.get("/bookings/received"),
        api.get("/bookings/my-bookings"),
        api.get("/orders/received"),
        api.get("/orders/my-orders"),
      ]);
      setStats(statsRes.data);
      setReceivedBookings(receivedRes.data);
      setMyBookings(myRes.data);
      setReceivedOrders(recvOrdersRes.data);
      setMyOrders(myOrdersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const updateBookingStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      toast.success(`Booking ${status}`);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update booking");
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success(`Order ${status}`);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update order");
    }
  };

  if (loading) return <p className="text-center py-16 text-secondary/50 dark:text-white/50">Loading dashboard...</p>;

  return (
    <div className="bg-bg dark:bg-ink min-h-[calc(100vh-72px)] px-6 py-8 transition-colors">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-secondary dark:text-white mb-6">Your Dashboard</h1>

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

        {/* Orders received (as seller) */}
        <h2 className="text-lg font-bold text-secondary dark:text-white mb-3">Orders Received</h2>
        {receivedOrders.length === 0 ? (
          <p className="text-secondary/50 dark:text-white/40 text-sm mb-8">No orders yet.</p>
        ) : (
          <div className="space-y-3 mb-10">
            {receivedOrders.map((o) => (
              <div
                key={o._id}
                className="bg-surface dark:bg-secondary/60 rounded-xl border border-secondary/10 dark:border-white/10 p-4 flex items-center justify-between flex-wrap gap-3"
              >
                <div className="flex items-center gap-3">
                  {o.productId?.images?.[0] && (
                    <img src={o.productId.images[0]} className="w-12 h-12 rounded-lg object-cover" alt="" />
                  )}
                  <div>
                    <p className="font-medium text-secondary dark:text-white text-sm">{o.productId?.title}</p>
                    <p className="text-xs text-secondary/50 dark:text-white/40">
                      {o.buyerId?.name} • Qty: {o.quantity} • Rs. {(o.price * o.quantity).toLocaleString()}
                    </p>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full capitalize ${statusStyle(o.status)}`}>
                      {o.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {o.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(o._id, "confirmed")}
                        className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => updateOrderStatus(o._id, "rejected")}
                        className="text-xs border border-secondary/20 dark:border-white/20 text-secondary dark:text-white px-3 py-1.5 rounded-lg hover:bg-secondary/5 dark:hover:bg-white/5"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {o.status === "confirmed" && (
                    <button
                      onClick={() => updateOrderStatus(o._id, "shipped")}
                      className="text-xs bg-secondary text-white px-3 py-1.5 rounded-lg hover:bg-secondary/80"
                    >
                      Mark Shipped
                    </button>
                  )}
                  {o.status === "shipped" && (
                    <button
                      onClick={() => updateOrderStatus(o._id, "delivered")}
                      className="text-xs bg-secondary text-white px-3 py-1.5 rounded-lg hover:bg-secondary/80"
                    >
                      Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* My orders (as buyer) */}
        <h2 className="text-lg font-bold text-secondary dark:text-white mb-3">Your Orders</h2>
        {myOrders.length === 0 ? (
          <p className="text-secondary/50 dark:text-white/40 text-sm mb-10">You haven't ordered anything yet.</p>
        ) : (
          <div className="space-y-3 mb-10">
            {myOrders.map((o) => (
              <div
                key={o._id}
                className="bg-surface dark:bg-secondary/60 rounded-xl border border-secondary/10 dark:border-white/10 p-4 flex items-center justify-between flex-wrap gap-3"
              >
                <div className="flex items-center gap-3">
                  {o.productId?.images?.[0] && (
                    <img src={o.productId.images[0]} className="w-12 h-12 rounded-lg object-cover" alt="" />
                  )}
                  <div>
                    <p className="font-medium text-secondary dark:text-white text-sm">{o.productId?.title}</p>
                    <p className="text-xs text-secondary/50 dark:text-white/40">
                      from {o.sellerId?.name} • Rs. {(o.price * o.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusStyle(o.status)}`}>
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Received bookings (as provider) */}
        <h2 className="text-lg font-bold text-secondary dark:text-white mb-3">Booking Requests Received</h2>
        {receivedBookings.length === 0 ? (
          <p className="text-secondary/50 dark:text-white/40 text-sm mb-8">No booking requests yet.</p>
        ) : (
          <div className="space-y-3 mb-10">
            {receivedBookings.map((b) => (
              <div
                key={b._id}
                className="bg-surface dark:bg-secondary/60 rounded-xl border border-secondary/10 dark:border-white/10 p-4 flex items-center justify-between flex-wrap gap-3"
              >
                <div>
                  <p className="font-medium text-secondary dark:text-white">{b.serviceId?.title}</p>
                  <p className="text-xs text-secondary/50 dark:text-white/40">
                    {b.customerId?.name} • {new Date(b.date).toLocaleDateString()} at {b.time}
                  </p>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full capitalize ${statusStyle(b.status)}`}>
                    {b.status}
                  </span>
                </div>

                <div className="flex gap-2">
                  {b.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateBookingStatus(b._id, "accepted")}
                        className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateBookingStatus(b._id, "rejected")}
                        className="text-xs border border-secondary/20 dark:border-white/20 text-secondary dark:text-white px-3 py-1.5 rounded-lg hover:bg-secondary/5 dark:hover:bg-white/5"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {b.status === "accepted" && (
                    <button
                      onClick={() => updateBookingStatus(b._id, "completed")}
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
        <h2 className="text-lg font-bold text-secondary dark:text-white mb-3">Your Bookings</h2>
        {myBookings.length === 0 ? (
          <p className="text-secondary/50 dark:text-white/40 text-sm">You haven't booked any services yet.</p>
        ) : (
          <div className="space-y-3">
            {myBookings.map((b) => (
              <div
                key={b._id}
                className="bg-surface dark:bg-secondary/60 rounded-xl border border-secondary/10 dark:border-white/10 p-4 flex items-center justify-between flex-wrap gap-3"
              >
                <div>
                  <p className="font-medium text-secondary dark:text-white">{b.serviceId?.title}</p>
                  <p className="text-xs text-secondary/50 dark:text-white/40">
                    with {b.providerId?.name} • {new Date(b.date).toLocaleDateString()} at {b.time}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusStyle(b.status)}`}>
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