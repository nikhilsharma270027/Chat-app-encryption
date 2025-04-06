import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    const hostme = conn.connection.host.split('-')[0];
    console.log(`MongoDB Connected : ${hostme}`);
  } catch (error) {
    console.log(`Error:${error.message}`);
    process.exit();
  }
};

export default connectDB ;
