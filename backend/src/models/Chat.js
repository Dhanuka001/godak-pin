const mongoose = require('mongoose');

const { Schema, Types } = mongoose;

const buildConversationKey = (senderId, receiverId) => {
  if (!senderId || !receiverId) return null;
  const ids = [senderId.toString(), receiverId.toString()].sort();
  return ids.join(':');
};

const chatSchema = new Schema(
  {
    message_id: { type: String, required: true, unique: true, default: () => new Types.ObjectId().toString() },
    sender_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    listing_id: { type: Schema.Types.ObjectId, ref: 'Item', default: null },
    content: { type: String, required: true, trim: true },
    timestamp: { type: Date, default: () => new Date() },
    read_status: { type: Boolean, default: false },
    conversation_key: { type: String, index: true },
  },
  { timestamps: true }
);

chatSchema.pre('validate', function ensureConversationKey(next) {
  if (this.conversation_key) return next();
  const key = buildConversationKey(this.sender_id, this.receiver_id);
  if (key) {
    this.conversation_key = key;
  }
  return next();
});

chatSchema.pre('save', function fixConversationKey(next) {
  if (!this.conversation_key) {
    this.conversation_key = buildConversationKey(this.sender_id, this.receiver_id);
  }
  return next();
});

chatSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Chat', chatSchema);
