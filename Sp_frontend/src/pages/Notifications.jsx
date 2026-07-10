import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCommentDots, FaCalendarCheck, FaStar, FaCheckCircle, FaBullhorn } from "react-icons/fa";
import api from "../services/api";

const iconFor = (type) => {
  switch (type) {
    case "message": return <FaCommentDots className="text-primary" />;
    case "booking": return <FaCalendarCheck className="text-primary" />;
    case "review": return <FaStar className="text-accent" />;
    case "listing_approved": return <FaCheckCircle className="text-green-600" />;
    default: return <FaBullhorn className="text-secondary/50" />;
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    await api.put("/notifications/read-all");
    fetchNotifications();
  };

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    fetchNotifications();
  };

  if (loading) return <p className="text-center py-16 text-secondary/50">Loading...</p>;

  return (
    <div className="bg-bg min-h-[calc(100vh-72px)] px-6 py-8">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-secondary">Notifications</h1>
          {notifications.some((n) => !n.isRead) && (
            <button onClick={markAllRead} className="text-sm text-primary hover:underline">
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="text-secondary/50 text-sm">You're all caught up.</p>
        ) : (
          <div className="space-y-2">
            {notifications.map((n, i) => (
              <motion.button
                key={n._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => markRead(n._id)}
                className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border transition ${
                  n.isRead
                    ? "bg-surface border-secondary/10"
                    : "bg-primary/5 border-primary/20"
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-white border border-secondary/10 flex items-center justify-center flex-shrink-0">
                  {iconFor(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-secondary">{n.message}</p>
                  <p className="text-xs text-secondary/40 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;