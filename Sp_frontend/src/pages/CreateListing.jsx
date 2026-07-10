import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CreateProduct from "./CreateProduct";
import CreateService from "./CreateService";
import ImageCompareSlider from "../components/ImageCompareSlider";

const SAMPLE_PRODUCT_IMG = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800";
const SAMPLE_SERVICE_IMG = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800";

const CreateListing = () => {
  const [tab, setTab] = useState("product");

  return (
    <div className="bg-bg min-h-[calc(100vh-72px)] px-6 py-8">
      <div className="max-w-lg mx-auto mb-6">
        <div className="mb-6">
          <ImageCompareSlider
            leftImg={SAMPLE_PRODUCT_IMG}
            rightImg={SAMPLE_SERVICE_IMG}
            leftLabel="Product"
            rightLabel="Service"
          />
        </div>

        <div className="relative flex bg-white rounded-xl border border-secondary/10 p-1">
          <motion.div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-lg"
            animate={{ x: tab === "product" ? 0 : "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
          <button
            onClick={() => setTab("product")}
            className={`relative z-10 flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              tab === "product" ? "text-white" : "text-secondary/70"
            }`}
          >
            Sell a Product
          </button>
          <button
            onClick={() => setTab("service")}
            className={`relative z-10 flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              tab === "service" ? "text-white" : "text-secondary/70"
            }`}
          >
            Offer a Service
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: tab === "product" ? -30 : 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: tab === "product" ? 30 : -30 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
        >
          {tab === "product" ? <CreateProduct embedded /> : <CreateService embedded />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CreateListing;