import Category from "../models/Category.js";
import mongoose from "mongoose";
import slugify from "slugify";

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Seller or Admin
export const createCategory = async (req, res) => {
  try {
    const { name, parent } = req.body;

    const rawName = name.replace(/['"]/g, ""); // Remove apostrophes and quotes
    const slug = slugify(rawName, { lower: true });

    console.log("Generated slug:", slug); 
    if (!name || !slug) {
      return res
        .status(400)
        .json({ success: false, message: "Name and slug are required." });
    }

    const existing = await Category.findOne({ $or: [{ name }, { slug }] });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Category name or slug already exists.",
      });
    }

    const newCategory = new Category({ name, slug, parent: parent || null });
    const savedCategory = await newCategory.save();

    res.status(201).json({ success: true, data: savedCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).populate(
      "parent"
    );
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format." });
    }

    const category = await Category.findById(req.params.id).populate("parent");
    if (!category || !category.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, parent } = req.body;
    const rawName = name.replace(/['"]/g, ""); // Remove apostrophes and quotes
    const slug = slugify(rawName, { lower: true });

    console.log("Generated slug:", slug); 
    if (!name || !slug) {
      return res
        .status(400)
        .json({ success: false, message: "Name and slug are required." });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format." });
    }

    const category = await Category.findById(req.params.id);
    if (!category || !category.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }

    if (name) category.name = name;
    if (slug) category.slug = slug;
    if (parent !== undefined) category.parent = parent;

    const updatedCategory = await category.save();

    res.json({ success: true, data: updatedCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format." });
    }

    const category = await Category.findById(req.params.id);
    if (!category || !category.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }

    category.isActive = false;
    await category.save();

    res.json({ success: true, message: "Category deactivated successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const restoreCategory = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format." });
    }

    const category = await Category.findById(req.params.id);
    if (!category || category.isActive) {
      return res.status(404).json({
        success: false,
        message: "Category not found or already active.",
      });
    }

    category.isActive = true;
    await category.save();

    res.json({
      success: true,
      message: "Category reactivated successfully.",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
