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
const MONGODB_LINK = "mongodb+srv://ShahrozMubarak:shahzor0101@cluster1.pagfciy.mongodb.net/"; 

export const getMongoURI = () => {
  return (
    (MONGODB_LINK && MONGODB_LINK.trim() !== "" ? MONGODB_LINK.trim() : null) ||
    process.env.MONGODB_URI ||
    ""
  );
};

let cachedPromise = null;

export const connectDB = async (retries = 2) => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  const uri = getMongoURI();

  if (!uri || uri === "PASTE_YOUR_MONGODB_URI_HERE" || uri.includes("<password>")) {
    console.warn("⚠️  [MongoDB] No connection link found yet.");
    console.warn("👉  Please configure MONGODB_URI in your Vercel Environment Variables or `.env`.");
    return false;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (cachedPromise) {
        await cachedPromise;
        if (mongoose.connection.readyState === 1) {
          return true;
        }
      }
    } catch {
      cachedPromise = null;
    }

    try {
      console.log(`🔄  [MongoDB] Connecting to cluster (attempt ${attempt}/${retries})...`);
      cachedPromise = mongoose.connect(uri, {
        dbName: 'zaytoun_atelier',
        serverSelectionTimeoutMS: 7000,
        connectTimeoutMS: 10000,
        maxPoolSize: 10,
        bufferCommands: true
      });
      await cachedPromise;
      if (mongoose.connection.readyState === 1) {
        console.log("✅  [MongoDB] Connected successfully to MongoDB Atlas database: zaytoun_atelier");
        return true;
      }
    } catch (error) {
      cachedPromise = null;
      console.error(`❌  [MongoDB] Connection error (attempt ${attempt}):`, error.message);
      if (attempt < retries) {
        await new Promise(res => setTimeout(res, 500));
      }
    }
  }

  return mongoose.connection.readyState === 1;
};

export const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

export default connectDB;
