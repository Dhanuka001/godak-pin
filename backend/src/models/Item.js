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
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ownerName: { type: String },
    ownerDistrict: { type: String },
    requests: { type: [requestSchema], default: [] },
  },
  { timestamps: true }
);

itemSchema.index({ title: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Item', itemSchema);
