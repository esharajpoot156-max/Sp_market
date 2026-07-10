import Booking from "../models/Booking.js";
import Service from "../models/Service.js";

// Create booking (customer books a service)
export const createBooking = async (req, res, next) => {
  try {
    const { serviceId, date, time, notes } = req.body;

    if (!serviceId || !date || !time) {
      return res.status(400).json({ message: "Please provide service, date and time" });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (service.providerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot book your own service" });
    }

    const booking = await Booking.create({
      serviceId,
      customerId: req.user._id,
      providerId: service.providerId,
      date,
      time,
      notes,
      price: service.price,
    });

    const populatedBooking = await booking.populate([
      { path: "serviceId", select: "title deliveryTime" },
      { path: "customerId", select: "name profilePicture" },
      { path: "providerId", select: "name profilePicture" },
    ]);

    res.status(201).json(populatedBooking);
  } catch (error) {
    next(error);
  }
};

// Get bookings where user is the customer
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customerId: req.user._id })
      .populate("serviceId", "title deliveryTime portfolioImages")
      .populate("providerId", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

// Get bookings where user is the provider (requests received)
export const getReceivedBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ providerId: req.user._id })
      .populate("serviceId", "title deliveryTime portfolioImages")
      .populate("customerId", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

// Get single booking
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("serviceId", "title deliveryTime portfolioImages")
      .populate("customerId", "name profilePicture")
      .populate("providerId", "name profilePicture");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isParty =
      booking.customerId._id.toString() === req.user._id.toString() ||
      booking.providerId._id.toString() === req.user._id.toString();

    if (!isParty && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this booking" });
    }

    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};

// Provider accepts or rejects a booking
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // "accepted" | "rejected" | "completed"

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this booking" });
    }

    const allowedTransitions = {
      pending: ["accepted", "rejected"],
      accepted: ["completed"],
    };

    if (!allowedTransitions[booking.status]?.includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${booking.status} to ${status}`,
      });
    }

    booking.status = status;
    if (status === "completed") booking.completedAt = new Date();

    await booking.save();

    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};

// Cancel booking (either party, only if pending/accepted)
export const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isParty =
      booking.customerId.toString() === req.user._id.toString() ||
      booking.providerId.toString() === req.user._id.toString();

    if (!isParty) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    if (!["pending", "accepted"].includes(booking.status)) {
      return res.status(400).json({ message: "This booking cannot be cancelled" });
    }

    booking.status = "cancelled";
    booking.cancelledBy = req.user._id;
    booking.cancelReason = reason || "";

    await booking.save();

    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};