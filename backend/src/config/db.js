const mongoose = require("mongoose");
const env = require("./env");

async function connectDatabase() {
  if (!env.MONGO_URI) {
    console.warn("MONGO_URI is not configured; protected data APIs will be unavailable.");
    return false;
  }

  await mongoose.connect(env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000
  });
  console.log("MongoDB connected");
  return true;
}

function databaseState() {
  return {
    connected: mongoose.connection.readyState === 1,
    state: mongoose.connection.readyState
  };
}

module.exports = { connectDatabase, databaseState };