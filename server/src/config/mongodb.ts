import mongoose from "mongoose";

const connectMongoDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("MONGODB_URI not set, skipping MongoDB connection");
    return;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 });
    console.log("MongoDB connected");
  } catch (error) {
    console.warn("MongoDB not available — continuing without it.");
  }
};

export default connectMongoDB;
