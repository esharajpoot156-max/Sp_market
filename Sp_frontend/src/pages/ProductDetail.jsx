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

  if (loading) return <p className="text-center py-16 text-secondary/50">Loading...</p>;
  if (!product) return <p className="text-center py-16 text-secondary/50">Product not found.</p>;

  return (
    <div className="bg-bg min-h-[calc(100vh-72px)] px-6 py-8">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="aspect-square bg-white rounded-xl overflow-hidden border border-secondary/10 mb-3">
            {product.images?.length > 0 ? (
              <img
                src={product.images[activeImg]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-secondary/30">
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
          <h1 className="text-2xl font-bold text-secondary mb-2">{product.title}</h1>
          <p className="text-3xl font-bold text-primary mb-4">
            Rs. {product.price?.toLocaleString()}
          </p>

          <div className="flex items-center gap-4 text-sm text-secondary/60 mb-6">
            <span className="flex items-center gap-1">
              <FaMapMarkerAlt size={12} /> {product.location?.city || "N/A"}
            </span>
            <span className="capitalize px-2 py-0.5 bg-accent/40 rounded-full text-xs">
              {product.condition}
            </span>
            {product.rating?.count > 0 && (
              <span className="flex items-center gap-1">
                <FaStar className="text-accent" size={12} />
                {product.rating.average.toFixed(1)} ({product.rating.count})
              </span>
            )}
          </div>

          <p className="text-secondary/80 leading-relaxed mb-6">{product.description}</p>

          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-secondary/10 mb-6">
            {product.sellerId?.profilePicture ? (
              <img
                src={product.sellerId.profilePicture}
                className="w-10 h-10 rounded-full object-cover"
                alt=""
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-secondary/20" />
            )}
            <div>
              <p className="font-medium text-secondary text-sm">{product.sellerId?.name}</p>
              <p className="text-xs text-secondary/50">Seller</p>
            </div>
          </div>

          <button
            onClick={handleMessageSeller}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition"
          >
            Message Seller
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;