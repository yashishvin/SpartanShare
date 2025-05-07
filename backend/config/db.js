const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Remove the deprecated options
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('- MONGO_URI set:', process.env.MONGO_URI ? 'Yes' : 'No');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;