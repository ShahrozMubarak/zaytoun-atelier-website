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
    paymentReceipt: { type: String }, // Base64 proof or receipt image URL
    receiptFileName: { type: String },
    receiptUploadedAt: { type: Date },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'approved', 'processing', 'dispatched', 'shipped', 'delivered', 'cancelled']
    },
    approvedAt: { type: Date },
    approvedBy: { type: String },
    whatsappNotificationSent: { type: Boolean, default: false },
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
