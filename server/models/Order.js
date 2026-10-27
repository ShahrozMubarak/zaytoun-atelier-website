import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    id: { type: String },
    customer: {
      firstName: String,
      lastName: String,
      name: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      province: String,
      postalCode: String,
      orderNotes: String
    },
    items: { type: Array, default: [] },
    total: { type: Number, required: true },
    pricing: { type: Object, default: {} },
    paymentMethod: { type: String, default: 'cod' }, // 'cod' | 'card' | 'jazzcash' | 'easypaisa'
    status: {
      type: String,
      default: 'processing',
      enum: ['processing', 'confirmed', 'dispatched', 'shipped', 'delivered', 'cancelled']
    },
    courier: { type: String, default: 'TCS Express' },
    trackingNumber: { type: String },
    createdAt: { type: Date, default: Date.now },
    date: { type: String }
  },
  {
    timestamps: true,
    strict: false
  }
);

export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export default Order;
