import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import ServiceCard from "../components/ServiceCard";
import AnimatedText from "../components/AnimatedText";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

const Home = () => {
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, servicesRes] = await Promise.all([
          api.get("/products?limit=8"),
          api.get("/services?limit=8"),
        ]);
        setProducts(productsRes.data.products);
        setServices(servicesRes.data.services);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-bg dark:bg-ink min-h-[calc(100vh-72px)] transition-colors">
      {/* Hero with 3D perspective */}
      <div
      className="bg-secondary dark:bg-gradient-to-br dark:from-[#1F1B29] dark:to-[#2A1A1F] px-6 py-20 text-center overflow-hidden border-b border-white/5 dark:border-primary/10"
      style={{ perspective: "1000px" }}>
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight" style={{ transformStyle: "preserve-3d" }}>
          <AnimatedText text="Buy, sell, and get things done" delayStart={0.1} />
          <br />
          <AnimatedText text="— locally." delayStart={0.7} className="text-primary" />
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-white/60 max-w-xl mx-auto"
        >
          One platform for your community's products and professional services.
        </motion.p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-secondary">Latest Products</h2>
          <Link to="/products" className="text-sm text-primary font-medium hover:underline">View all →</Link>
        </div>

        {loading ? (
          <p className="text-secondary/50 text-sm">Loading...</p>
        ) : products.length === 0 ? (
          <p className="text-secondary/50 text-sm">No products yet. Be the first to list one!</p>
        ) : (
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {products.map((p) => (
              <motion.div key={p._id} variants={item}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-secondary">Popular Services</h2>
          <Link to="/services" className="text-sm text-primary font-medium hover:underline">View all →</Link>
        </div>

        {loading ? (
          <p className="text-secondary/50 text-sm">Loading...</p>
        ) : services.length === 0 ? (
          <p className="text-secondary/50 text-sm">No services yet. Offer the first one!</p>
        ) : (
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

export default Home;