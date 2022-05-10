import mongoose from "mongoose";

//connection function
const connectDb = async (DATABASE_URL) => {
  try {
    const DB_OPTION = {
      dbname: "auth_api",
    };
    await mongoose.connect(DATABASE_URL, DB_OPTION);
    console.log("connected");
  } catch (error) {
    console.log("connected");
  }
};

export default connectDb;
