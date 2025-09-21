import slugify from "slugify";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import cloudinary from "../config/cloudinary.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildPriceFilter = (minPrice, maxPrice) => {
  const priceFilter = {};
  if (minPrice !== undefined && minPrice !== "") {
    const min = Number(minPrice);
    if (Number.isNaN(min)) throw new Error("minPrice must be a valid number");
    priceFilter.$gte = min;
  }
  if (maxPrice !== undefined && maxPrice !== "") {
    const max = Number(maxPrice);
    if (Number.isNaN(max)) throw new Error("maxPrice must be a valid number");
    priceFilter.$lte = max;
  }
  return Object.keys(priceFilter).length ? priceFilter : undefined;
};

const buildSortOption = (sort) => {
  switch (sort) {
    case "price_asc":
      return { basePrice: 1 };
    case "price_desc":
      return { basePrice: -1 };
    case "popular":
      return { ratingsAverage: -1 };
    default:
      return { createdAt: -1 };
  }
};

const populateFields = [
  { path: "categories", select: "name slug" },
  { path: "seller", select: "name email" },
];

/* ---------- Create Product ---------- */
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      brand,
      basePrice,
      discountPercentage = 0,
      taxPercentage = 0,
      stock,
      images = [],
      categories,
    } = req.body;

    if (!name || !description || !basePrice || !stock || !categories) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "At least one category is required.",
        });
    }

    for (const catId of categories) {
      if (!isValidObjectId(catId)) {
        return res
          .status(400)
          .json({ success: false, message: `Invalid category ID: ${catId}` });
      }
    }

    const slug = slugify(name, { lower: true, strict: true });
    if (await Product.findOne({ slug })) {
      return res
        .status(409)
        .json({ success: false, message: "Product slug already exists." });
    }

    const product = await Product.create({
      name,
      slug,
      description,
      brand: brand || "",
      basePrice,
      discountPercentage,
      taxPercentage,
      stock,
      images,
      categories,
      seller: req.user.id,
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Shared Query Logic ---------- */
export const listProducts = async (req, res, baseQuery = {}) => {
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

    const query = { ...baseQuery };

    // text filters
    if (search?.trim()) query.name = { $regex: search.trim(), $options: "i" };
    if (brand?.trim()) query.brand = { $regex: brand.trim(), $options: "i" };

    // ----- CATEGORY FILTER -----
    if (category?.trim()) {
      let categoryIds = [];

      // if valid ObjectId, use it directly
      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryIds.push(category);
        const subCats = await Category.find({ ancestors: category }).select(
          "_id"
        );
        categoryIds.push(...subCats.map((c) => c._id));
      } else {
        // otherwise treat it as a name or slug (case-insensitive)
        const parentCat = await Category.findOne({
          $or: [
            { name: new RegExp(`^${category}$`, "i") },
            { slug: new RegExp(`^${category}$`, "i") },
          ],
        }).select("_id");
        if (!parentCat) {
          return res.status(404).json({
            success: false,
            message: "Category not found",
          });
        }
        categoryIds.push(parentCat._id);
        const subCats = await Category.find({
          ancestors: parentCat._id,
        }).select("_id");
        categoryIds.push(...subCats.map((c) => c._id));
      }

      query.categories = { $in: categoryIds };
    }

    // price range
    const priceFilter = buildPriceFilter(minPrice, maxPrice);
    if (priceFilter) query.basePrice = priceFilter;

    // pagination & fetch
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("categories") // or your populateFields
      .sort(buildSortOption(sort))
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Exported listings ---------- */
export const getAllProducts = (req, res) =>
  listProducts(req, res, { isActive: true });
export const getAllProductsAdmin = (req, res) => listProducts(req, res);
export const getAllProductsBySeller = (req, res) =>
  listProducts(req, res, { seller: req.user._id });

/* ---------- Single Product ---------- */
export const getProductById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID." });
    }
    const product = await Product.findById(req.params.id).populate(
      populateFields.concat({
        path: "seller",
        select: "name email role avatar",
      })
    );
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Update Product ---------- */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    if (
      product.seller.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    const fields = [
      "name",
      "description",
      "brand",
      "basePrice",
      "discountPercentage",
      "taxPercentage",
      "stock",
      "images",
      "categories",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) product[f] = req.body[f];
    });

    if (req.body.name) {
      product.slug = slugify(req.body.name, { lower: true, strict: true });
    }

    const updated = await product.save();
    res.json({ success: true, product: updated, message: "Product updated." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Delete Product ---------- */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });

    if (
      product.seller.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    for (const img of product.images) {
      if (img.publicId) {
        await cloudinary.uploader.destroy(img.publicId, {
          invalidate: true,
          resource_type: "image",
        });
      }
    }

    await Product.findByIdAndDelete(product._id);
    res.json({ success: true, message: "Product deleted permanently." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Toggle Status ---------- */
export const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });

    if (
      product.seller.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    product.isActive = !product.isActive;
    await product.save();
    res.json({
      success: true,
      message: `Product ${
        product.isActive ? "restored" : "deactivated"
      } successfully.`,
      product,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Count ---------- */
export const getProductCount = async (_req, res) => {
  try {
    const count = await Product.countDocuments({ isActive: true });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Products by Category (with subcategories) ---------- */
export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!isValidObjectId(categoryId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID." });
    }

    const categoryIds = [categoryId];
    const subCats = await Category.find({ ancestors: categoryId }).select(
      "_id"
    );
    subCats.forEach((c) => categoryIds.push(c._id));

    const products = await Product.find({
      categories: { $in: categoryIds },
      isActive: true,
    })
      .populate(populateFields)
      .sort({ createdAt: -1 });

    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};