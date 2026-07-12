import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaStar, FaMapMarkerAlt } from "react-icons/fa";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showOrder, setShowOrder] = useState(false);
  const [order, setOrder] = useState({ quantity: 1, city: "", details: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => toast.error("Product not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleMessageSeller = () => {
    if (!user) {
      toast.error("Please log in to message the seller");
      return navigate("/login");
    }
    navigate(`/chat/${product.sellerId._id}`);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to buy this product");
      return navigate("/login");
    }
    setSubmitting(true);
    try {
      await api.post("/orders", {
        productId: id,
        quantity: order.quantity,
        city: order.city,
        details: order.details,
        notes: order.notes,
      });
      toast.success("Order request sent to seller!");
      setShowOrder(false);
      navigate("/dashboard/orders");
    } catch (err) {
      toast.error(err.response?.data?.message || "Order failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center py-16 text-secondary/50 dark:text-white/50">Loading...</p>;
  if (!product) return <p className="text-center py-16 text-secondary/50 dark:text-white/50">Product not found.</p>;

  return (
    <div className="bg-bg dark:bg-ink min-h-[calc(100vh-72px)] px-6 py-8 transition-colors">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="aspect-square bg-surface dark:bg-secondary/60 rounded-xl overflow-hidden border border-secondary/10 dark:border-white/10 mb-3">
            {product.images?.length > 0 ? (
              <img
                src={product.images[activeImg]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-secondary/30 dark:text-white/30">
                No image
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    activeImg === i ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-2xl font-bold text-secondary dark:text-white mb-2">{product.title}</h1>
          <p className="text-3xl font-bold text-primary mb-4">
            Rs. {product.price?.toLocaleString()}
          </p>

          <div className="flex items-center gap-4 text-sm text-secondary/60 dark:text-white/50 mb-6 flex-wrap">
            <span className="flex items-center gap-1">
              <FaMapMarkerAlt size={12} /> {product.location?.city || "N/A"}
            </span>
            <span className="capitalize px-2 py-0.5 bg-accent/40 rounded-full text-xs">
              {product.condition}
            </span>
            {product.isSold && (
              <span className="px-2 py-0.5 bg-secondary/10 dark:bg-white/10 rounded-full text-xs">
                Sold
              </span>
            )}
            {product.rating?.count > 0 && (
              <span className="flex items-center gap-1">
                <FaStar className="text-accent" size={12} />
                {product.rating.average.toFixed(1)} ({product.rating.count})
              </span>
            )}
          </div>

          <p className="text-secondary/80 dark:text-white/70 leading-relaxed mb-6">{product.description}</p>

          <div className="flex items-center gap-3 p-4 bg-surface dark:bg-secondary/60 rounded-xl border border-secondary/10 dark:border-white/10 mb-6">
            {product.sellerId?.profilePicture ? (
              <img
                src={product.sellerId.profilePicture}
                className="w-10 h-10 rounded-full object-cover"
                alt=""
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-secondary/20 dark:bg-white/10" />
            )}
            <div>
              <p className="font-medium text-secondary dark:text-white text-sm">{product.sellerId?.name}</p>
              <p className="text-xs text-secondary/50 dark:text-white/40">Seller</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowOrder(true)}
              disabled={product.isSold}
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {product.isSold ? "Sold Out" : "Buy Now"}
            </button>
            <button
              onClick={handleMessageSeller}
              className="flex-1 border border-secondary/20 dark:border-white/20 hover:bg-secondary/5 dark:hover:bg-white/5 text-secondary dark:text-white font-medium py-3 rounded-lg transition"
            >
              Message Seller
            </button>
          </div>

          {/* Order form */}
          {showOrder && (
            <form
              onSubmit={handleOrderSubmit}
              className="mt-6 p-5 bg-surface dark:bg-secondary/60 rounded-xl border border-secondary/10 dark:border-white/10 space-y-4"
            >
              <h3 className="font-bold text-secondary dark:text-white">Confirm your order</h3>

              <div>
                <label className="block text-xs font-medium text-secondary dark:text-white/70 mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={order.quantity}
                  onChange={(e) => setOrder({ ...order, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-secondary/20 dark:border-white/20 dark:bg-secondary/40 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary dark:text-white/70 mb-1">Delivery city</label>
                <input
                  type="text"
                  required
                  value={order.city}
                  onChange={(e) => setOrder({ ...order, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-secondary/20 dark:border-white/20 dark:bg-secondary/40 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary dark:text-white/70 mb-1">Address details</label>
                <textarea
                  rows={2}
                  value={order.details}
                  onChange={(e) => setOrder({ ...order, details: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-secondary/20 dark:border-white/20 dark:bg-secondary/40 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="House #, street, area..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary dark:text-white/70 mb-1">Notes (optional)</label>
                <textarea
                  rows={2}
                  value={order.notes}
                  onChange={(e) => setOrder({ ...order, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-secondary/20 dark:border-white/20 dark:bg-secondary/40 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60"
              >
                {submitting ? "Sending request..." : "Confirm Order"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;