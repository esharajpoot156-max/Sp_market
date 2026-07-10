import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaStar, FaClock } from "react-icons/fa";

const ServiceCard = ({ service }) => {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link
        to={`/services/${service._id}`}
        className="block bg-white rounded-xl border border-secondary/10 overflow-hidden hover:shadow-md transition group"
      >
        <div className="aspect-video bg-secondary/5 overflow-hidden">
          {service.portfolioImages?.[0] ? (
            <img
              src={service.portfolioImages[0]}
              alt={service.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-secondary/30 text-sm">
              No image
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="flex items-center gap-2 mb-1">
            {service.providerId?.profilePicture ? (
              <img
                src={service.providerId.profilePicture}
                className="w-5 h-5 rounded-full object-cover"
                alt=""
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-secondary/20" />
            )}
            <span className="text-xs text-secondary/60">{service.providerId?.name}</span>
          </div>
          <h3 className="font-medium text-secondary text-sm truncate">{service.title}</h3>
          <div className="flex items-center justify-between mt-2">
            <span className="flex items-center gap-1 text-xs text-secondary/50">
              <FaClock size={11} /> {service.deliveryTime}d delivery
            </span>
            {service.rating?.count > 0 && (
              <span className="flex items-center gap-1 text-xs text-secondary/60">
                <FaStar className="text-accent" size={11} />
                {service.rating.average.toFixed(1)}
              </span>
            )}
          </div>
          <p className="text-primary font-bold mt-2">Starting at Rs. {service.price?.toLocaleString()}</p>
        </div>
      </Link>
    </motion.div>
  );
};

export default ServiceCard;