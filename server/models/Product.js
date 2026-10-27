import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    slug: { type: String },
    person: { type: String, default: 'women' }, // 'women' | 'men' | 'kids'
    category: { type: String, default: 'Apparel' },
    slot: { type: String, default: 'top' }, // 'top' | 'bottom' | 'outer' | 'dress'
    style: { type: String, default: 'shirt' },
    collectionName: { type: String, default: 'Atelier Core' },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    badge: { type: String },
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 0 },
    primaryColor: { type: String },
    colors: { type: Array, default: [] },
    sizes: { type: Array, default: ['XS', 'S', 'M', 'L', 'XL'] },
    stockPerSize: { type: Object, default: { XS: 5, S: 10, M: 15, L: 8, XL: 4 } },
    images: { type: [String], default: [] },
    description: { type: String, default: '' },
    fabric: { type: String, default: '' },
    care: { type: String, default: '' },
    fit: { type: String, default: '' },
    asset: { type: Object }
  },
  {
    timestamps: true,
    strict: false // Allows dynamic custom fields
  }
);

export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export default Product;
