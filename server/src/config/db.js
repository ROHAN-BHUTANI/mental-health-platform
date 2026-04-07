const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (process.env.NODE_ENV === "development") {
    console.log("Mongo URI loaded:", uri ? "YES" : "NO");
  }

  if (!uri) {
    console.error("MongoDB connection failed: MONGO_URI missing");
    process.exit(1);
  }

  // Connection lifecycle logs
  mongoose.connection.on("connected", () => {
    if (process.env.NODE_ENV === "development") {
      console.log("MongoDB Connected Successfully");
    }
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB Connection Error:", err.message);
    console.error("Check MongoDB Atlas IP whitelist and credentials.");
  });

  mongoose.connection.on("disconnected", () => {
    if (process.env.NODE_ENV === "development") {
      console.warn("MongoDB Disconnected");
    }
  });

  try {
    if (process.env.NODE_ENV === "development") {
      console.log("Connecting to MongoDB...");
    }
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 20000
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.error("If using Atlas, ensure IP whitelist allows your host (e.g., 0.0.0.0/0) and credentials/URI are correct.");
    process.exit(1);
  }
};

module.exports = connectDB;
