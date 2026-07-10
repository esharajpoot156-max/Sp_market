import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";

const ProductCard = ({ product }) => {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link
        to={`/products/${product._id}`}
        className="block bg-white rounded-xl border border-secondary/10 overflow-hidden hover:shadow-md transition group"
      >
        <div className="aspect-square bg-accent/40 overflow-hidden">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-secondary/30 text-sm">
              No image
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-medium text-secondary text-sm truncate">{product.title}</h3>
          <p className="text-primary font-bold mt-1">Rs. {product.price?.toLocaleString()}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-secondary/50">{product.location?.city}</span>
            {product.rating?.count > 0 && (
              <span className="flex items-center gap-1 text-xs text-secondary/60">
                <FaStar className="text-accent" size={11} />
                {product.rating.average.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;