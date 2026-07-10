import express from "express";
import {
  updateProfile,
  uploadProfilePicture,
  getUserById,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.put("/profile", protect, updateProfile);
router.post("/profile/picture", protect, upload.single("profilePicture"), uploadProfilePicture);
router.get("/:id", getUserById);

export default router;