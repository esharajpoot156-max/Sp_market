import User from "../models/User.js";
import Product from "../models/Product.js";
import Service from "../models/Service.js";
import Report from "../models/Report.js";
import Booking from "../models/Booking.js";

// ---------- Dashboard stats ----------
export const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalProducts, totalServices, totalBookings, pendingReports] =
      await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Service.countDocuments(),
        Booking.countDocuments(),
        Report.countDocuments({ status: "pending" }),
      ]);

    const pendingProducts = await Product.countDocuments({ status: "pending" });
    const pendingServices = await Service.countDocuments({ status: "pending" });

    res.status(200).json({
      totalUsers,
      totalProducts,
      totalServices,
      totalBookings,
      pendingReports,
      pendingListings: pendingProducts + pendingServices,
    });
  } catch (error) {
    next(error);
  }
};

// ---------- User management ----------
export const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;

    const query = {};
    if (search) query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
    if (role) query.role = role;

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({ users, totalPages: Math.ceil(total / limit), currentPage: Number(page) });
  } catch (error) {
    next(error);
  }
};

export const suspendUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isSuspended = true;
    await user.save();

    res.status(200).json({ message: "User suspended", user });
  } catch (error) {
    next(error);
  }
};

export const unsuspendUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isSuspended = false;
    await user.save();

    res.status(200).json({ message: "User unsuspended", user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    next(error);
  }
};

// ---------- Listing approval ----------
export const getPendingListings = async (req, res, next) => {
  try {
    const pendingProducts = await Product.find({ status: "pending" }).populate("sellerId", "name email");
    const pendingServices = await Service.find({ status: "pending" }).populate("providerId", "name email");

    res.status(200).json({ pendingProducts, pendingServices });
  } catch (error) {
    next(error);
  }
};

export const approveListing = async (req, res, next) => {
  try {
    const { type, id } = req.params; // type: "product" | "service"

    const Model = type === "product" ? Product : Service;
    const listing = await Model.findById(id);

    if (!listing) return res.status(404).json({ message: "Listing not found" });

    listing.status = "approved";
    await listing.save();

    res.status(200).json({ message: `${type} approved`, listing });
  } catch (error) {
    next(error);
  }
};

export const rejectListing = async (req, res, next) => {
  try {
    const { type, id } = req.params;

    const Model = type === "product" ? Product : Service;
    const listing = await Model.findById(id);

    if (!listing) return res.status(404).json({ message: "Listing not found" });

    listing.status = "removed";
    await listing.save();

    res.status(200).json({ message: `${type} rejected`, listing });
  } catch (error) {
    next(error);
  }
};

// ---------- Reported content ----------
export const getAllReports = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const reports = await Report.find(query)
      .populate("reporterId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    next(error);
  }
};

export const updateReportStatus = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body; // "reviewed" | "dismissed"

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    report.status = status;
    if (adminNote !== undefined) report.adminNote = adminNote;
    await report.save();

    res.status(200).json(report);
  } catch (error) {
    next(error);
  }
};