import express from "express";
import {
  createBooking,
  getMyBookings,
  getReceivedBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/my-bookings", protect, getMyBookings);
router.get("/received", protect, getReceivedBookings);
router.get("/:id", protect, getBookingById);
router.put("/:id/status", protect, updateBookingStatus);
router.put("/:id/cancel", protect, cancelBooking);

export default router;