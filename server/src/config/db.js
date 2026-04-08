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

  if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
    console.error("MongoDB connection failed: MONGO_URI has invalid format");
    console.error("Expected MONGO_URI to start with mongodb:// or mongodb+srv://");
    console.error("A shell-level MONGO_URI may be overriding .env");
    console.error("CMD fix: set MONGO_URI=");
    console.error("PowerShell fix: Remove-Item Env:MONGO_URI -ErrorAction SilentlyContinue");
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

    // Backward compatibility migration: old deployments may still have a unique
    // index on (userId, date), which prevents multiple entries in a single day.
    try {
      const moodLogCollection = mongoose.connection.collection("moodlogs");
      const indexes = await moodLogCollection.indexes();
      const legacyUniqueIndex = indexes.find(
        (index) => index?.name === "userId_1_date_1" && index?.unique
      );

      if (legacyUniqueIndex) {
        await moodLogCollection.dropIndex("userId_1_date_1");
        if (process.env.NODE_ENV === "development") {
          console.log("Dropped legacy unique index: userId_1_date_1");
        }
      }
    } catch (indexError) {
      if (process.env.NODE_ENV === "development") {
        console.warn("MoodLog index migration skipped:", indexError.message);
      }
    }
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.error("If using Atlas, ensure IP whitelist allows your host (e.g., 0.0.0.0/0) and credentials/URI are correct.");
    process.exit(1);
  }
};

module.exports = connectDB;
