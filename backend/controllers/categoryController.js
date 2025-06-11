// Updated Category Controller with multi-parent hierarchy support

import Category from "../models/Category.js";
import mongoose from "mongoose";
import slugify from "slugify";

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Seller or Admin
export const createCategory = async (req, res) => {
  try {
    const { name, parents = [] } = req.body;

    const rawName = name.replace(/['"]/g, "");
    const slug = slugify(rawName, { lower: true });

    if (!name || !slug) {
      return res.status(400).json({ success: false, message: "Name and slug are required." });
    }

    const existing = await Category.findOne({ $or: [{ name }, { slug }] });
    if (existing) {
      return res.status(409).json({ success: false, message: "Category name or slug already exists." });
    }

    // Compute ancestors
    let ancestorsSet = new Set();
    if (parents.length) {
      const parentCats = await Category.find({ _id: { $in: parents } });
      for (const parent of parentCats) {
        parent.ancestors.forEach(id => ancestorsSet.add(id.toString()));
        ancestorsSet.add(parent._id.toString());
      }
    }

    const newCategory = new Category({
      name,
      slug,
      parents,
      ancestors: [...ancestorsSet],
    });

    const savedCategory = await newCategory.save();
    res.status(201).json({ success: true, category: savedCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all active categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).populate("parents");
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all categories (active or inactive)
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("parents");
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a category by ID
export const getCategoryById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format." });
    }

    const category = await Category.findById(req.params.id).populate("parents");
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a category
export const updateCategory = async (req, res) => {
  try {
    const { name, parents = [] } = req.body;
    const rawName = name.replace(/['"]/g, "");
    const slug = slugify(rawName, { lower: true });

    if (!name || !slug) {
      return res.status(400).json({ success: false, message: "Name and slug are required." });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format." });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    category.name = name;
    category.slug = slug;
    category.parents = parents;

    // Recompute ancestors
    let ancestorsSet = new Set();
    if (parents.length) {
      const parentCats = await Category.find({ _id: { $in: parents } });
      for (const parent of parentCats) {
        parent.ancestors.forEach(id => ancestorsSet.add(id.toString()));
        ancestorsSet.add(parent._id.toString());
      }
    }
    category.ancestors = [...ancestorsSet];

    const updatedCategory = await category.save();
    res.json({ success: true, category: updatedCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a category
export const deleteCategory = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format." });
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    res.json({ success: true, message: "Category deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle category active status
export const toggleCategory = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format." });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.json({
      success: true,
      message: category.isActive ? "Category reactivated successfully." : "Category deactivated successfully.",
      category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
