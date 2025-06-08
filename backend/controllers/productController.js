import slugify from "slugify";
import Product from "../models/Product.js";
import mongoose from "mongoose";

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      brand,
      price,
      discountPrice,
      stock,
      images,
      category,
    } = req.body;

    const rawName = name.replace(/['"]/g, "");
    const slug = slugify(rawName, { lower: true, strict: true });

    if (
      !name ||
      !slug ||
      !description ||
      !price ||
      !stock ||
      !images ||
      !category
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "All required fields must be filled.",
        });
    }

    const existing = await Product.findOne({ slug });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Product slug already exists." });
    }

    const product = new Product({
      name,
      slug,
      description,
      brand: brand || "",
      price,
      discountPrice: discountPrice || price,
      stock,
      images: images || [],
      category,
      createdBy: req.user.id,
    });

    const saved = await product.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Internal server error.",
      });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sort = "latest",
    } = req.query;

    console.log("Raw Query Parameters:", req.query);

    const query = { isActive: true };

    // Search by name
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by brand
    if (brand) {
      query.brand = { $regex: brand, $options: "i" };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};

      if (minPrice) {
        const min = Number(minPrice);
        if (isNaN(min)) {
          return res.status(400).json({
            success: false,
            message: "minPrice must be a valid number",
          });
        }
        query.price.$gte = min;
      }

      if (maxPrice) {
        const max = Number(maxPrice);
        if (isNaN(max)) {
          return res.status(400).json({
            success: false,
            message: "maxPrice must be a valid number",
          });
        }
        query.price.$lte = max;
      }
    }

    console.log("Final Query Object:", query);

    // Sorting
    let sortOption = { createdAt: -1 }; // default: latest first
    if (sort === "price_asc") sortOption = { price: 1 };
    else if (sort === "price_desc") sortOption = { price: -1 };
    else if (sort === "popular") sortOption = { ratingsAverage: -1 };

    // Pagination
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("category", "name")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  }
};

export const getAllProductsAdmin = async (req, res) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sort = "latest",
    } = req.query;
    console.log("Raw Query Parameters:", req.query);
    const query = {};
    // Search by name
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    // Filter by category
    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid category ID." });
      }
      query.category = category;
    }
    // Filter by brand
    if (brand) {
      query.brand = { $regex: brand, $options: "i" };
    }
    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        const min = Number(minPrice);
        if (isNaN(min)) {
          return res.status(400).json({
            success: false,
            message: "minPrice must be a valid number",
          });
        }
        query.price.$gte = min;
      }
      if (maxPrice) {
        const max = Number(maxPrice);
        if (isNaN(max)) {
          return res.status(400).json({
            success: false,
            message: "maxPrice must be a valid number",
          });
        }
        query.price.$lte = max;
      }
    }
    console.log("Final Query Object:", query);
    // Sorting
    let sortOption = { createdAt: -1 }; // default: latest first
    if (sort === "price_asc") sortOption = { price: 1 };
    else if (sort === "price_desc") sortOption = { price: -1 };
    else if (sort === "popular") sortOption = { ratingsAverage: -1 };
    // Pagination
    const total = await Product.countDocuments(query);
    const products = await Product.find
      (query)
      .populate("category")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  }
}

export const getAllProductsBySeller = async (req, res) => {
  try {
    // Validate user is authenticated
    if (!req.user.role || req.user.role !== "seller") {
      console.error("Unauthorized access attempt:", req.user);
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access." });
    }
    const sellerId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    const query = { createdBy: sellerId };
    const total = await Product.countDocuments(query);
    const products = await Product.find
      (query)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error("Error in getAllProductsBySeller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID." });
    }

    const product = await Product.findById(id).populate("category");
    if (!product || !product.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Internal server error.",
      });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (product.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to update this product",
        });
    }

    const updatableFields = [
      "name",
      "description",
      "price",
      "discountPrice",
      "brand",
      "category",
      "stock",
      "images",
      "ratingsAverage",
      "numReviews",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    if (req.body.name) {
      const rawName = req.body.name.replace(/['"]/g, "");
      product.slug = slugify(rawName, { lower: true, strict: true });
    }

    if (req.body.price && !req.body.discountPrice) {
      product.discountPrice = req.body.price;
    }

    const updatedProduct = await product.save();
    res.json({
      success: true,
      data: updatedProduct,
      message: "Product updated successfully.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Product not found or already deleted.",
        });
    }
    if (
      product.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to delete this product.",
        });
    }
    // permanently delete
    await Product.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Product deleted permanently." });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Internal server error.",
      });
  }
};

export const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (
      product.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to change product status.",
        });
    }

    product.isActive = !product.isActive;
    await product.save();
    res.json({
      success: true,
      message: `Product ${
        product.isActive ? "restored" : "deactivated"
      } successfully.`,
      data: product,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Internal server error.",
      });
  }
};

export const getProductCount = async (req, res) => {
  try {
    const count = await Product.countDocuments({ isActive: true });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID." });
    }

    const products = await Product.find({
      category: categoryId,
      isActive: true,
    })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    if (products.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No products found in this category.",
        });
    }

    res.json({ success: true, data: products });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Internal server error.",
      });
  }
};
