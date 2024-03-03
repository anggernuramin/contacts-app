// Connect ke mongodb local menggunakan package mongoose
import mongoose from "mongoose";

const connectDb = mongoose.connect("mongodb://127.0.0.1:27017/contacts-app");

export default connectDb;
