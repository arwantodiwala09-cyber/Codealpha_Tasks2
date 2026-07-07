const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
require("colors");

let mongoServer;

const connectDB = async () => {
  mongoose.set("bufferCommands", false);
  mongoose.set("bufferTimeoutMS", 5000);

  const connectOptions = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  };

  const localMongoURI = process.env.LOCAL_MONGODB_URI || "mongodb://127.0.0.1:27017/ecommerce";

  if (process.env.MONGODB_URI) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, connectOptions);
      console.log(`MongoDB Connected: ${conn.connection.host}`.green.bold);
      return conn;
    } catch (error) {
      console.error("========== Atlas MongoDB Connection Error ==========".red);
      console.error(error.message || error);
      console.error("==============================================".red);
    }
  }

  if (process.env.NODE_ENV === "development") {
    try {
      const conn = await mongoose.connect(localMongoURI, connectOptions);
      console.log(`Local MongoDB Connected: ${conn.connection.host}`.green.bold);
      return conn;
    } catch (error) {
      console.warn("Unable to connect to local MongoDB. Falling back to in-memory server.".yellow);
      console.error(error.message || error);
    }

    try {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      const conn = await mongoose.connect(uri, connectOptions);
      console.log("MongoDB Memory Server connected".green.bold);
      return conn;
    } catch (error) {
      console.error("========== In-Memory MongoDB Connection Error ==========".red);
      console.error(error.message || error);
      console.error("==============================================".red);
    }
  }

  console.error("Unable to establish a MongoDB connection.");
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }

  throw new Error("Unable to establish a MongoDB connection.");
};

module.exports = connectDB;