const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserInteractionSchema = new Schema({
  userId: { type: mongoose.ObjectId, ref: 'User', required: true },
  productId: [{ type: mongoose.ObjectId, ref: 'Product', required: true }], // Can handle single or multiple products
  eventType: {
    type: String,
    required: true,
    enum: ['viewed_product', 'added_to_cart', 'purchased','added_to_wishlist'], // Event types
  },
  timestamp: { type: Date, default: Date.now }, // Automatically captures the interaction time
  metadata: { type: Map, of: Schema.Types.Mixed, default: {} }, // Additional metadata
});

const virtual = UserInteractionSchema.virtual('id');
virtual.get(function() {
  return this._id;
});

UserInteractionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  },
});

// Exporting the model
const UserInteraction = mongoose.model('UserInteraction', UserInteractionSchema);

module.exports = UserInteraction;
