import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

const CreateProduct = ({ embedded = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "", description: "", price: "", category: "", city: "", condition: "new",
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => data.append(key, val));
      images.forEach((img) => data.append("images", img));
      const res = await api.post("/products", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Product listed! Pending admin approval.");
      navigate(`/products/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <>
      {!embedded && <h1 className="text-2xl font-bold text-secondary dark:text-white mb-6">List a Product</h1>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary dark:text-white/80 mb-1">Title</label>
          <input
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 dark:border-white/20 dark:bg-secondary/40 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary dark:text-white/80 mb-1">Description</label>
          <textarea
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 dark:border-white/20 dark:bg-secondary/40 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary dark:text-white/80 mb-1">Price (Rs.)</label>
            <input
              type="number"
              name="price"
              required
              min="0"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 dark:border-white/20 dark:bg-secondary/40 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary dark:text-white/80 mb-1">Condition</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 dark:border-white/20 dark:bg-secondary/40 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary dark:text-white/80 mb-1">Category</label>
          <select
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 dark:border-white/20 dark:bg-secondary/40 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Select category</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Clothing">Clothing</option>
            <option value="Books">Books</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary dark:text-white/80 mb-1">City</label>
          <input
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 dark:border-white/20 dark:bg-secondary/40 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary dark:text-white/80 mb-1">Images (up to 5)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(Array.from(e.target.files).slice(0, 5))}
            className="w-full text-sm dark:text-white/70"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60"
        >
          {loading ? "Publishing..." : "Publish Listing"}
        </button>
      </form>
    </>
  );

  if (embedded) {
    return <div className="max-w-lg mx-auto bg-surface dark:bg-secondary/60 rounded-2xl border border-secondary/10 dark:border-white/10 p-8">{formContent}</div>;
  }

  return (
    <div className="bg-bg dark:bg-ink min-h-[calc(100vh-72px)] px-6 py-8 transition-colors">
      <div className="max-w-lg mx-auto bg-surface dark:bg-secondary/60 rounded-2xl border border-secondary/10 dark:border-white/10 p-8">
        {formContent}
      </div>
    </div>
  );
};

export default CreateProduct;