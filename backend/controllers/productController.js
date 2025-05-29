import Product from '../models/Product.js';
import mongoose from 'mongoose';

export const createProduct = async (req, res) => {
  try {
    const {
      name, slug, description, brand,
      price, discountPrice, stock, images, category,
    } = req.body;

    if (!name || !slug || !description || !price || !stock || !images || !category) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
    }

    const existing = await Product.findOne({ slug });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Product slug already exists.' });
    }

    const product = new Product({
      name,
      slug,
      description,
      brand,
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
    res.status(500).json({ success: false, message: error.message || 'Internal server error.' });
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
      sort = 'latest',
    } = req.query;

    const query = { isActive: true };

    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (brand) query.brand = { $regex: brand, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Determine sort order
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'popular') sortOption = { ratingsAverage: -1 };

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }

    const product = await Product.findById(id).populate('category', 'createdBy');
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Internal server error.' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if the logged-in user is the owner
    if (product.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this product' });
    }

    // Update fields
    const updatableFields = ['name', 'description', 'price', 'brand', 'category', 'stock', 'images'];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    const updatedProduct = await product.save();

    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    // Check if the logged-in user is the owner or an admin
    if (product.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this product.' });
    }
    product.isActive = false;
    await product.save();

    res.json({ success: true, message: 'Product deactivated (soft deleted).' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Internal server error.'});
  }
};

export const restoreProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found or already active.' });
    }

    // Check if the logged-in user is an admin or the owner
    if (product.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to restore this product.' });
    }
    // Restore the product
    product.isActive = true;
    await product.save();

    res.json({ success: true, message: 'Product restored successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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




