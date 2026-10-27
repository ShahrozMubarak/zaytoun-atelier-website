import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    city: { type: String, trim: true },
    province: { type: String, trim: true },
    address: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    ordersCount: { type: Number, default: 1 },
    totalSpent: { type: Number, default: 0 },
    orderHistory: [{ type: String }],
    lastOrderDate: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

export const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
export default Customer;
