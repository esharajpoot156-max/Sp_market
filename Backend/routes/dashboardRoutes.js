import express from "express";
import { getMyDashboard, getRecentActivity } from "../controllers/dashboardController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getMyDashboard);
router.get("/activity", protect, getRecentActivity);

export default router;