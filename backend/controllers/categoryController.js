import mongoose from "mongoose";
import slugify from "slugify";
import Category from "../models/Category.js";

/**
 * Helper to compute ancestor IDs for a set of parents.
 */
async function buildAncestors(parents = []) {
  if (!parents.length) return [];
  const parentDocs = await Category.find({ _id: { $in: parents } });
  const ancestorsSet = new Set();
  parentDocs.forEach((p) => {
    p.ancestors.forEach((id) => ancestorsSet.add(id.toString()));
    ancestorsSet.add(p._id.toString());
  });
  return [...ancestorsSet];
}

/** -------------------- Create -------------------- */
export const createCategory = async (req, res) => {
  try {
    const { name, parents = [], image = "" } = req.body;

    if (!name?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required." });
    }
    const rawName = name.replace(/['"]/g, "");
    const slug = slugify(rawName, { lower: true });

    // Ensure uniqueness for name or slug
    const exists = await Category.findOne({ $or: [{ name }, { slug }] });
    if (exists) {
      return res
        .status(409)
        .json({
          success: false,
          message: "Category name or slug already exists.",
        });
    }

    const ancestors = await buildAncestors(parents);

    const category = await Category.create({
      name,
      slug,
      parents,
      ancestors,
      image,
    });

    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** -------------------- Read -------------------- */
export const getCategories = async (_req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).populate(
      "parents",
      "name slug image"
    );
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllCategories = async (_req, res) => {
  try {
    const categories = await Category.find().populate(
      "parents",
      "name slug image"
    );
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format." });
    }

    const category = await Category.findById(id).populate(
      "parents",
      "name slug image"
    );
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }

    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** -------------------- Update -------------------- */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parents = [], image } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format." });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }

    if (name) {
      const rawName = name.replace(/['"]/g, "");
      const slug = slugify(rawName, { lower: true });
      // check uniqueness excluding current category
      const exists = await Category.findOne({
        _id: { $ne: id },
        $or: [{ name }, { slug }],
      });
      if (exists) {
        return res
          .status(409)
          .json({
            success: false,
            message: "Category name or slug already exists.",
          });
      }
      category.name = name;
      category.slug = slug;
    }

    category.parents = parents;
    category.ancestors = await buildAncestors(parents);
    if (image !== undefined) category.image = image;

    const updated = await category.save();
    res.json({ success: true, category: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** -------------------- Delete -------------------- */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format." });
    }

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }

    res.json({ success: true, message: "Category deleted successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** -------------------- Toggle Active/Inactive -------------------- */
export const toggleCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format." });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.json({
      success: true,
      message: category.isActive
        ? "Category reactivated successfully."
        : "Category deactivated successfully.",
      category,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
