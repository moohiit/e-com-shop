import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  ancestors:  [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

// Before saving, recompute the ancestors array
categorySchema.pre('save', async function(next) {
  if (!this.parent) {
    this.ancestors = [];
    return next();
  }
  // Load parent to grab its ancestors
  const parentCat = await this.constructor.findById(this.parent).exec();
  if (!parentCat) return next(new Error('Parent category not found'));
  // Compose ancestors = [ ...parent.ancestors, parent._id ]
  this.ancestors = [...parentCat.ancestors, parentCat._id];
  next();
});

export default Category;
