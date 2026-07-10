import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  getMyProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/my-products", protect, getMyProducts);
router.get("/:id", getProductById);
router.post("/", protect, upload.array("images", 5), createProduct);
router.put("/:id", protect, upload.array("images", 5), updateProduct);
router.delete("/:id", protect, deleteProduct);

export default router;