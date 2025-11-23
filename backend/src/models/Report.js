const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reporterName: { type: String },
    reporterEmail: { type: String },
    reason: { type: String, required: true },
    message: { type: String, default: '' },
    status: { type: String, enum: ['open', 'resolved'], default: 'open', index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
