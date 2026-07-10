import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  suspendUser,
  unsuspendUser,
  deleteUser,
  getPendingListings,
  approveListing,
  rejectListing,
  getAllReports,
  updateReportStatus,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, adminOnly); // sab admin routes protected + admin-only hain

router.get("/stats", getDashboardStats);

router.get("/users", getAllUsers);
router.put("/users/:id/suspend", suspendUser);
router.put("/users/:id/unsuspend", unsuspendUser);
router.delete("/users/:id", deleteUser);

router.get("/listings/pending", getPendingListings);
router.put("/listings/:type/:id/approve", approveListing);
router.put("/listings/:type/:id/reject", rejectListing);

router.get("/reports", getAllReports);
router.put("/reports/:id", updateReportStatus);

export default router;