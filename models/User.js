// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   phone: { type: String },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// });

// export default mongoose.model("User", userSchema);



// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, default: "" },
  password: { type: String, default: null }, // null for social logins
  provider: { type: String, enum: ["local", "google"], default: "local" },
  googleId: { type: String, default: null },
  avatar: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
