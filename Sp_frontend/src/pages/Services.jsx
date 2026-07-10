import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";
import api from "../services/api";
import ServiceCard from "../components/ServiceCard";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", category: "", sort: "" });

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.category) params.append("category", filters.category);
      if (filters.sort) params.append("sort", filters.sort);

      const res = await api.get(`/services?${params.toString()}`);
      setServices(res.data.services);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchServices, 400);
    return () => clearTimeout(timeout);
  }, [filters]);

  return (
    <div className="bg-bg min-h-[calc(100vh-72px)] px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-secondary mb-6">Browse Services</h1>

        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40" size={14} />
            <input
              type="text"
              placeholder="Search services..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">All Categories</option>
            <option value="Graphic Designing">Graphic Designing</option>
            <option value="Web Development">Web Development</option>
            <option value="Photography">Photography</option>
            <option value="Home Services">Home Services</option>
            <option value="Tutoring">Tutoring</option>
            <option value="Content Writing">Content Writing</option>
            <option value="Digital Marketing">Digital Marketing</option>
            <option value="Video Editing">Video Editing</option>
          </select>

          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="delivery_fast">Fastest Delivery</option>
          </select>
        </div>

        {loading ? (
          <p className="text-secondary/50 text-sm">Loading...</p>
        ) : services.length === 0 ? (
          <p className="text-secondary/50 text-sm">No services found.</p>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {services.map((s) => (
              <motion.div key={s._id} variants={item}>
                <ServiceCard service={s} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Services;