import Product from "../models/Product.js";
import streamUpload from "../utils/cloudinaryUpload.js";

// Create product
export const createProduct = async (req, res, next) => {
  try {
    const { title, description, price, category, city, country, condition, stock } = req.body;

    if (!title || !description || !price || !category) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        streamUpload(file.buffer, "sp-market/products")
      );
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((r) => r.secure_url);
    }

    const product = await Product.create({
      title,
      description,
      price,
      category,
      condition,
      stock,
      images: imageUrls,
      location: { city, country },
      sellerId: req.user._id,
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// Get all products (with filters + search)
export const getProducts = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, city, sort, page = 1, limit = 12 } = req.query;

    const query = { status: "approved", isSold: false };

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

    const products = await Product.find(query)
      .populate("sellerId", "name profilePicture rating")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// Get single product
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "sellerId",
      "name profilePicture rating location"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.views += 1;
    await product.save();

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// Get logged-in user's own products
export const getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ sellerId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

// Update product
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this product" });
    }

    const { title, description, price, category, city, country, condition, stock, isSold } = req.body;

    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (condition) product.condition = condition;
    if (stock !== undefined) product.stock = stock;
    if (isSold !== undefined) product.isSold = isSold;
    if (city) product.location.city = city;
    if (country) product.location.country = country;

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        streamUpload(file.buffer, "sp-market/products")
      );
      const results = await Promise.all(uploadPromises);
      product.images = [...product.images, ...results.map((r) => r.secure_url)];
    }

    product.status = "pending"; // re-approval after edit
    await product.save();

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// Delete product
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.sellerId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    await product.deleteOne();
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    next(error);
  }
};