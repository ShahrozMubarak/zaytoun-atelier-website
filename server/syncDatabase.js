import { connectDB } from './db.js';
import Product from './models/Product.js';
import { SEED_PRODUCTS } from './seedData.js';

async function syncCatalogToDB() {
  console.log('🔄 Connecting to MongoDB Atlas database: zaytoun_atelier...');
  const connected = await connectDB();
  if (!connected) {
    console.error('❌ Could not connect to MongoDB Atlas. Check MONGODB_URI in .env');
    process.exit(1);
  }

  console.log('🗑️  Purging all legacy mock products from MongoDB...');
  const deleteResult = await Product.deleteMany({});
  console.log(`✅ Deleted ${deleteResult.deletedCount} old products from MongoDB.`);

  console.log(`📦 Seeding ${SEED_PRODUCTS.length} realistic Outfitters-style products...`);
  const inserted = await Product.insertMany(SEED_PRODUCTS);
  console.log(`🎉 Successfully seeded ${inserted.length} realistic apparel products into MongoDB Atlas!`);

  console.log('\n--- VERIFIED SEEDED PRODUCTS ---');
  inserted.forEach((p, i) => {
    console.log(`  ${i + 1}. [${p.gender.toUpperCase()}] ${p.name} — Rs. ${p.price.toLocaleString()} (${p.fitLine || p.category})`);
  });

  process.exit(0);
}

syncCatalogToDB().catch(err => {
  console.error('❌ Failed syncing catalog:', err);
  process.exit(1);
});
