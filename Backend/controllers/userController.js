import User from "../models/User.js";
import streamUpload from "../utils/cloudinaryUpload.js";

export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, bio, phone, city, country, skills } = req.body;

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (city !== undefined) user.location.city = city;
    if (country !== undefined) user.location.country = country;
    if (skills) user.skills = Array.isArray(skills) ? skills : skills.split(",").map(s => s.trim());

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

    const result = await streamUpload(req.file.buffer, "sp-market/profile-pictures");

    const user = await User.findById(req.user._id);
    user.profilePicture = result.secure_url;
    await user.save();

    res.status(200).json({
      message: "Profile picture updated",
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      "name profilePicture bio location skills rating createdAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};