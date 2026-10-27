import mongoose from 'mongoose';

const SubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    source: {
      type: String,
      default: 'website_footer', // 'website_footer', 'homepage_cta', 'checkout'
      trim: true
    },
    status: {
      type: String,
      enum: ['active', 'unsubscribed'],
      default: 'active'
    },
    ipAddress: { type: String },
    userAgent: { type: String }
  },
  {
    timestamps: true
  }
);

export const Subscriber = mongoose.models.Subscriber || mongoose.model('Subscriber', SubscriberSchema);
export default Subscriber;
