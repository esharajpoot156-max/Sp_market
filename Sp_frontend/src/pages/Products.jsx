import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";
import api from "../services/api";
import ProductCard from "../components/ProductCard";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", category: "", sort: "" });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.category) params.append("category", filters.category);
      if (filters.sort) params.append("sort", filters.sort);

      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchProducts, 400); // debounce search
    return () => clearTimeout(timeout);
  }, [filters]);

  return (
    <div className="bg-bg min-h-[calc(100vh-72px)] px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-secondary mb-6">Browse Products</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40" size={14} />
            <input
              type="text"
              placeholder="Search products..."
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
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Clothing">Clothing</option>
            <option value="Books">Books</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {loading ? (
          <p className="text-secondary/50 text-sm">Loading...</p>
        ) : products.length === 0 ? (
          <p className="text-secondary/50 text-sm">No products found.</p>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {products.map((p) => (
              <motion.div key={p._id} variants={item}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Products;