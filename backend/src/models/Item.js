const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: { type: String },
    name: { type: String },
  },
  { timestamps: true }
);

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, required: true },
    condition: { type: String, required: true },
    imageUrl: { type: String, default: '/images/placeholder.jpg' },
    images: [
      {
        url: { type: String },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    status: {
      type: String,
      enum: ['available', 'reserved', 'given'],
      default: 'available',
      index: true,
    },
    slug: { type: String, unique: true, sparse: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ownerName: { type: String },
    ownerDistrict: { type: String },
    requests: { type: [requestSchema], default: [] },
  },
  { timestamps: true }
);

itemSchema.index({ title: 'text', description: 'text', category: 'text' });

const slugify = (text) =>
  text
    .toString()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

itemSchema.pre('save', function buildSlug(next) {
  if (!this.isModified('title') && !this.isModified('district') && !this.isModified('city') && this.slug) {
    return next();
  }

  const base = [this.title, this.city, this.district].filter(Boolean).join(' ');
  const baseSlug = slugify(base) || 'item';
  const uniqueSuffix = (this._id || new mongoose.Types.ObjectId()).toString().slice(-6);
  this.slug = `${baseSlug}-${uniqueSuffix}`;

  return next();
});

module.exports = mongoose.model('Item', itemSchema);
