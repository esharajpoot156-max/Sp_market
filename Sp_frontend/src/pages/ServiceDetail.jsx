import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaStar, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const ServiceDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [booking, setBooking] = useState({ date: "", time: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/services/${id}`)
      .then((res) => setService(res.data))
      .catch(() => toast.error("Service not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleMessageProvider = () => {
    if (!user) {
      toast.error("Please log in to message the provider");
      return navigate("/login");
    }
    navigate(`/chat/${service.providerId._id}`);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to book this service");
      return navigate("/login");
    }
    setSubmitting(true);
    try {
      await api.post("/bookings", {
        serviceId: id,
        date: booking.date,
        time: booking.time,
        notes: booking.notes,
      });
      toast.success("Booking request sent!");
      setShowBooking(false);
      navigate("/dashboard/bookings");
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center py-16 text-secondary/50">Loading...</p>;
  if (!service) return <p className="text-center py-16 text-secondary/50">Service not found.</p>;

  return (
    <div className="bg-bg min-h-[calc(100vh-72px)] px-6 py-8">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
        {/* Portfolio images */}
        <div>
          <div className="aspect-video bg-white rounded-xl overflow-hidden border border-secondary/10 mb-3">
            {service.portfolioImages?.[0] ? (
              <img
                src={service.portfolioImages[0]}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-secondary/30">
                No portfolio image
              </div>
            )}
          </div>
          {service.portfolioImages?.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {service.portfolioImages.slice(1).map((img, i) => (
                <img key={i} src={img} className="w-20 h-20 rounded-lg object-cover" alt="" />
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-2xl font-bold text-secondary mb-2">{service.title}</h1>
          <p className="text-3xl font-bold text-primary mb-4">
            Rs. {service.price?.toLocaleString()}
          </p>

          <div className="flex items-center gap-4 text-sm text-secondary/60 mb-6 flex-wrap">
            <span className="flex items-center gap-1">
              <FaClock size={12} /> {service.deliveryTime} day delivery
            </span>
            <span className="flex items-center gap-1">
              <FaMapMarkerAlt size={12} /> {service.location?.city || "N/A"}
            </span>
            {service.rating?.count > 0 && (
              <span className="flex items-center gap-1">
                <FaStar className="text-accent" size={12} />
                {service.rating.average.toFixed(1)} ({service.rating.count})
              </span>
            )}
          </div>

          <p className="text-secondary/80 leading-relaxed mb-6">{service.description}</p>

          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-secondary/10 mb-6">
            {service.providerId?.profilePicture ? (
              <img
                src={service.providerId.profilePicture}
                className="w-10 h-10 rounded-full object-cover"
                alt=""
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-secondary/20" />
            )}
            <div>
              <p className="font-medium text-secondary text-sm">{service.providerId?.name}</p>
              <p className="text-xs text-secondary/50">{service.providerId?.bio || "Service Provider"}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowBooking(true)}
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition"
            >
              Book Now
            </button>
            <button
              onClick={handleMessageProvider}
              className="flex-1 border border-secondary/20 hover:bg-secondary/5 text-secondary font-medium py-3 rounded-lg transition"
            >
              Message
            </button>
          </div>

          {/* Booking form */}
          {showBooking && (
            <form
              onSubmit={handleBookingSubmit}
              className="mt-6 p-5 bg-white rounded-xl border border-secondary/10 space-y-4"
            >
              <h3 className="font-bold text-secondary">Schedule this service</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1">Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={booking.date}
                    onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-secondary/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={booking.time}
                    onChange={(e) => setBooking({ ...booking, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-secondary/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-secondary mb-1">Notes (optional)</label>
                <textarea
                  rows={3}
                  value={booking.notes}
                  onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-secondary/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Tell the provider what you need..."
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60"
              >
                {submitting ? "Sending request..." : "Confirm Booking Request"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;