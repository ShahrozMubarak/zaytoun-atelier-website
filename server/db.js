import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * ============================================================================
 * 🌿 ZAYTOUN ATELIER - MONGODB CONNECTION CONFIGURATION
 * ============================================================================
 * You can paste your MongoDB connection link in either of TWO places:
 * 
 * OPTION 1 (Easiest):
 *   Paste your MongoDB URI directly into the quotes below:
 *   const MONGODB_LINK = "mongodb+srv://<username>:<password>@cluster0.mongodb.net/zaytoun?retryWrites=true&w=majority";
 * 
 * OPTION 2 (Environment file):
 *   Paste it into the `.env` file in your root folder:
 *   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0...
 * ============================================================================
 */

// >>>>> PASTE YOUR MONGODB LINK BETWEEN THE QUOTES BELOW (OR IN .env) <<<<<
const MONGODB_LINK = ""; 

export const getMongoURI = () => {
  return (
    (MONGODB_LINK && MONGODB_LINK.trim() !== "" ? MONGODB_LINK.trim() : null) ||
    process.env.MONGODB_URI ||
    ""
  );
};

let cachedPromise = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (cachedPromise) {
    try {
      await cachedPromise;
      return mongoose.connection.readyState === 1;
    } catch {
      cachedPromise = null;
    }
  }

  const uri = getMongoURI();

  if (!uri || uri === "PASTE_YOUR_MONGODB_URI_HERE" || uri.includes("<password>")) {
    console.warn("⚠️  [MongoDB] No connection link found yet.");
    console.warn("👉  Please configure MONGODB_URI in your Vercel Environment Variables or `.env`.");
    return false;
  }

  try {
    console.log("🔄  [MongoDB] Connecting to cluster...");
    cachedPromise = mongoose.connect(uri, {
      dbName: 'zaytoun_atelier'
    });
    await cachedPromise;
    console.log("✅  [MongoDB] Connected successfully to MongoDB Atlas database: zaytoun_atelier");
    return true;
  } catch (error) {
    cachedPromise = null;
    console.error("❌  [MongoDB] Connection error:", error.message);
    return false;
  }
};

export const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

export default connectDB;
