import express from "express";
import {
  createService,
  getServices,
  getServiceById,
  getMyServices,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getServices);
router.get("/my-services", protect, getMyServices);
router.get("/:id", getServiceById);
router.post("/", protect, upload.array("portfolioImages", 5), createService);
router.put("/:id", protect, upload.array("portfolioImages", 5), updateService);
router.delete("/:id", protect, deleteService);

export default router;