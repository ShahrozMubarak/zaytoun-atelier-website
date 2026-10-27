/* global use, db */
// ==============================================================================
// 🍃 ZAYTOUN ATELIER - MONGODB VS CODE PLAYGROUND
// ==============================================================================
// How to use in VS Code:
// 1. Make sure you are connected to MongoDB in the VS Code sidebar.
// 2. Click the "▶" (Run / Execute) button at the top right of this editor tab.
// 3. The live MongoDB results will open in a split window on your right!
// ==============================================================================

// Select the database
use('zaytoun_atelier');

// 1. View all newsletter subscribers
console.log('--- 📬 NEWSLETTER SUBSCRIBERS ---');
const subscribers = db.subscribers.find().toArray();
console.log(`Total subscribers: ${subscribers.length}`);

// 2. View all registered customer profiles
console.log('--- 👤 CUSTOMER PROFILES ---');
const customers = db.customers.find().toArray();
console.log(`Total customers: ${customers.length}`);

// 3. View all client orders
console.log('--- 📦 ORDERS ---');
const orders = db.orders.find().toArray();
console.log(`Total orders: ${orders.length}`);

// 4. View products catalog in MongoDB
console.log('--- 🌿 PRODUCTS ---');
const products = db.products.find({}, { name: 1, price: 1, category: 1, person: 1 }).toArray();
console.log(`Total products: ${products.length}`);

// 5. View concierge inquiries
console.log('--- 💌 CONCIERGE INQUIRIES ---');
const inquiries = db.inquiries.find().toArray();
console.log(`Total inquiries: ${inquiries.length}`);

// Output summary object
({
  database: 'zaytoun_atelier',
  totalSubscribers: subscribers.length,
  subscribersList: subscribers,
  totalCustomers: customers.length,
  customersList: customers,
  totalOrders: orders.length,
  ordersList: orders
});
