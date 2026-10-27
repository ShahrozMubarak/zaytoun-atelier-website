import mongoose from 'mongoose';

const ThemeConfigSchema = new mongoose.Schema(
  {
    brand: { type: String, default: 'ZAYTOUN & CO.' },
    olive: { type: String, default: '#364634' },
    camel: { type: String, default: '#C69F6F' },
    linen: { type: String, default: '#FAF8F5' },
    onyx: { type: String, default: '#111315' }
  },
  {
    timestamps: true
  }
);

export const ThemeConfig = mongoose.models.ThemeConfig || mongoose.model('ThemeConfig', ThemeConfigSchema);
export default ThemeConfig;
