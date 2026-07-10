import Product from "../models/Product.js";
import Service from "../models/Service.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";

// Logged-in user's own dashboard (works for both buyer and seller/provider roles)
export const getMyDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [
      myProducts,
      myServices,
      bookingsAsCustomer,
      bookingsAsProvider,
      myReviews,
    ] = await Promise.all([
      Product.find({ sellerId: userId }),
      Service.find({ providerId: userId }),
      Booking.find({ customerId: userId }),
      Booking.find({ providerId: userId }),
      Review.find({ targetId: userId }),
    ]);

    // Listings summary
    const totalProducts = myProducts.length;
    const totalServices = myServices.length;
    const soldProducts = myProducts.filter((p) => p.isSold).length;

    // Bookings summary
    const completedAsProvider = bookingsAsProvider.filter((b) => b.status === "completed");
    const pendingAsProvider = bookingsAsProvider.filter((b) => b.status === "pending").length;
    const activeAsCustomer = bookingsAsCustomer.filter((b) =>
      ["pending", "accepted"].includes(b.status)
    ).length;

    // Earnings (dummy calculation — sum of completed bookings + sold products)
    const bookingEarnings = completedAsProvider.reduce((sum, b) => sum + b.price, 0);
    const productEarnings = myProducts
      .filter((p) => p.isSold)
      .reduce((sum, p) => sum + p.price, 0);
    const totalEarnings = bookingEarnings + productEarnings;

    // Monthly earnings breakdown (dummy — based on completedAt/updatedAt month)
    const monthlyEarnings = {};
    completedAsProvider.forEach((b) => {
      const month = new Date(b.completedAt || b.updatedAt).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      monthlyEarnings[month] = (monthlyEarnings[month] || 0) + b.price;
    });

    // Rating summary
    const avgRating =
      myReviews.length > 0
        ? myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length
        : 0;

    res.status(200).json({
      listings: {
        totalProducts,
        totalServices,
        soldProducts,
      },
      bookings: {
        totalAsCustomer: bookingsAsCustomer.length,
        totalAsProvider: bookingsAsProvider.length,
        activeAsCustomer,
        pendingAsProvider,
        completedAsProvider: completedAsProvider.length,
      },
      earnings: {
        total: totalEarnings,
        fromBookings: bookingEarnings,
        fromProducts: productEarnings,
        monthlyBreakdown: monthlyEarnings,
      },
      rating: {
        average: Number(avgRating.toFixed(1)),
        totalReviews: myReviews.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Recent activity feed (last 10 events combined)
export const getRecentActivity = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [recentBookings, recentReviews] = await Promise.all([
      Booking.find({ $or: [{ customerId: userId }, { providerId: userId }] })
        .populate("serviceId", "title")
        .sort({ updatedAt: -1 })
        .limit(5),
      Review.find({ targetId: userId })
        .populate("reviewerId", "name")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const activity = [
      ...recentBookings.map((b) => ({
        type: "booking",
        message: `Booking for "${b.serviceId?.title || "a service"}" is ${b.status}`,
        date: b.updatedAt,
      })),
      ...recentReviews.map((r) => ({
        type: "review",
        message: `${r.reviewerId?.name || "Someone"} left a ${r.rating}★ review`,
        date: r.createdAt,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json(activity.slice(0, 10));
  } catch (error) {
    next(error);
  }
};