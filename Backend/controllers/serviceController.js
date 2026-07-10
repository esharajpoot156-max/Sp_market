import Service from "../models/Service.js";
import streamUpload from "../utils/cloudinaryUpload.js";

// Create service
export const createService = async (req, res, next) => {
  try {
    const { title, description, category, price, deliveryTime, city, country, days, startTime, endTime } = req.body;

    if (!title || !description || !category || !price || !deliveryTime) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        streamUpload(file.buffer, "sp-market/services")
      );
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((r) => r.secure_url);
    }

    const service = await Service.create({
      title,
      description,
      category,
      price,
      deliveryTime,
      portfolioImages: imageUrls,
      location: { city, country },
      availability: {
        days: days ? (Array.isArray(days) ? days : days.split(",")) : [],
        startTime: startTime || "09:00",
        endTime: endTime || "18:00",
      },
      providerId: req.user._id,
    });

    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
};

// Get all services (search + filter)
export const getServices = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, city, sort, page = 1, limit = 12 } = req.query;

    const query = { status: "approved", isActive: true };

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (city) query["location.city"] = city;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "delivery_fast") sortOption = { deliveryTime: 1 };

    const services = await Service.find(query)
      .populate("providerId", "name profilePicture rating")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Service.countDocuments(query);

    res.status(200).json({
      services,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// Get single service
export const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate(
      "providerId",
      "name profilePicture rating bio skills location"
    );

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    service.views += 1;
    await service.save();

    res.status(200).json(service);
  } catch (error) {
    next(error);
  }
};

// Get logged-in provider's own services
export const getMyServices = async (req, res, next) => {
  try {
    const services = await Service.find({ providerId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(services);
  } catch (error) {
    next(error);
  }
};

// Update service
export const updateService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (service.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this service" });
    }

    const { title, description, category, price, deliveryTime, city, country, days, startTime, endTime, isActive } = req.body;

    if (title) service.title = title;
    if (description) service.description = description;
    if (category) service.category = category;
    if (price) service.price = price;
    if (deliveryTime) service.deliveryTime = deliveryTime;
    if (isActive !== undefined) service.isActive = isActive;
    if (city) service.location.city = city;
    if (country) service.location.country = country;
    if (days) service.availability.days = Array.isArray(days) ? days : days.split(",");
    if (startTime) service.availability.startTime = startTime;
    if (endTime) service.availability.endTime = endTime;

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        streamUpload(file.buffer, "sp-market/services")
      );
      const results = await Promise.all(uploadPromises);
      service.portfolioImages = [...service.portfolioImages, ...results.map((r) => r.secure_url)];
    }

    service.status = "pending"; // re-approval after edit
    await service.save();

    res.status(200).json(service);
  } catch (error) {
    next(error);
  }
};

// Delete service
export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (service.providerId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this service" });
    }

    await service.deleteOne();
    res.status(200).json({ message: "Service deleted" });
  } catch (error) {
    next(error);
  }
};