import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-secondary dark:bg-[#14121A] text-white/70 border-t border-white/5 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <h3 className="text-xl font-extrabold text-white mb-2">
            Sp<span className="text-primary">.market</span>
          </h3>
          <p className="text-sm text-white/50 leading-relaxed">
            Your community's marketplace for products and professional services.
          </p>
        </div>

        {/* Explore */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-primary transition">Products</Link></li>
            <li><Link to="/services" className="hover:text-primary transition">Services</Link></li>
            <li><Link to="/products/new" className="hover:text-primary transition">Sell a Product</Link></li>
            <li><Link to="/services/new" className="hover:text-primary transition">Offer a Service</Link></li>
          </ul>
        </div>

        {/* Account */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Account</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="hover:text-primary transition">Log In</Link></li>
            <li><Link to="/register" className="hover:text-primary transition">Sign Up</Link></li>
            <li><Link to="/dashboard" className="hover:text-primary transition">Dashboard</Link></li>
            <li><Link to="/profile" className="hover:text-primary transition">Profile</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Get in touch</h4>
          <p className="flex items-center gap-2 text-sm mb-4">
            <FaEnvelope size={13} /> support@spmarket.com
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-primary transition">
              <FaFacebookF size={13} />
            </a>
            <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-primary transition">
              <FaInstagram size={13} />
            </a>
            <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-primary transition">
              <FaTwitter size={13} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 py-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Sp.market. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;