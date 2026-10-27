import { connectDB } from './db.js';
import Subscriber from './models/Subscriber.js';
import Customer from './models/Customer.js';
import Order from './models/Order.js';
import Product from './models/Product.js';
import Inquiry from './models/Inquiry.js';

async function viewAll() {
  console.log('🔄 Connecting to MongoDB Atlas...');
  const connected = await connectDB();
  if (!connected) {
    console.error('❌ Could not connect. Check MONGODB_URI in .env');
    process.exit(1);
  }

  const [subs, custs, ords, prods, inqs] = await Promise.all([
    Subscriber.find().sort({ createdAt: -1 }),
    Customer.find().sort({ createdAt: -1 }),
    Order.find().sort({ createdAt: -1 }),
    Product.find().select('id name price category person'),
    Inquiry.find().sort({ createdAt: -1 })
  ]);

  console.log('\n======================================================');
  console.log(`🍃 MONGODB ATLAS DATABASE: zaytoun_atelier`);
  console.log('======================================================');

  console.log(`\n📬 SUBSCRIBERS (${subs.length}):`);
  if (subs.length === 0) console.log('  (No subscribers yet)');
  else {
    subs.forEach((s, idx) => {
      console.log(`  ${idx + 1}. ${s.email} [Source: ${s.source}] (${s.createdAt?.toISOString() || 'Recent'})`);
    });
  }

  console.log(`\n👤 CUSTOMER PROFILES (${custs.length}):`);
  if (custs.length === 0) console.log('  (No customers yet)');
  else {
    custs.forEach((c, idx) => {
      console.log(`  ${idx + 1}. ${c.name} (${c.email}) - Phone: ${c.phone || 'N/A'} | Orders: ${c.ordersCount || 1} | Spent: Rs. ${(c.totalSpent || 0).toLocaleString()}`);
    });
  }

  console.log(`\n📦 ORDERS (${ords.length}):`);
  if (ords.length === 0) console.log('  (No orders yet)');
  else {
    ords.forEach((o, idx) => {
      console.log(`  ${idx + 1}. #${o.orderNumber} - Rs. ${(o.total || 0).toLocaleString()} [${o.status.toUpperCase()}] Courier: ${o.courier}`);
    });
  }

  console.log(`\n🌿 PRODUCTS IN CATALOG (${prods.length}):`);
  prods.slice(0, 5).forEach((p, idx) => {
    console.log(`  ${idx + 1}. ${p.name} - Rs. ${p.price.toLocaleString()} (${p.category})`);
  });
  if (prods.length > 5) console.log(`  ... and ${prods.length - 5} more products`);

  console.log(`\n💌 CONCIERGE INQUIRIES (${inqs.length}):`);
  if (inqs.length === 0) console.log('  (No inquiries yet)');
  else {
    inqs.forEach((i, idx) => {
      console.log(`  ${idx + 1}. ${i.name} (${i.email}): "${i.message.slice(0, 50)}..."`);
    });
  }

  console.log('\n======================================================\n');
  process.exit(0);
}

viewAll().catch(err => {
  console.error(err);
  process.exit(1);
});
