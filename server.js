// import express from "express";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import cors from "cors";
// import helmet from "helmet";
// import morgan from "morgan";
// import authRoutes from "./routes/auth.js";

// dotenv.config();
// const app = express();

// console.log("Loaded MONGO_URI:", process.env.MONGO_URI);

// // Middleware
// app.use(express.json());
// app.use(helmet());

// // CORS: allow Netlify frontend
// const allowedOrigins = [
//   "https://cute-meerkat-09e723.netlify.app",
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       }
//       return callback(new Error("Not allowed by CORS"));
//     },
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
//   })
// );

// // Handle preflight for all routes
// app.options("*", cors());
// app.use(morgan("dev"));

// // Routes
// app.use("/api/auth", authRoutes);


// // DB connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB connected"))
//   .catch(err => console.error("❌ MongoDB connection error:", err));

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();

// Debug Mongo URI (optional, remove in production)
console.log("Loaded MONGO_URI:", process.env.MONGO_URI);

// ====== Middleware ======
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

// ====== CORS Config ======
const allowedOrigins = [
  "https://cute-meerkat-09e723.netlify.app", // your Netlify frontend
  "http://localhost:5173", // local development
  "http://localhost:3000", // alternative local port
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ====== Routes ======
app.get("/", (req, res) => {
  res.send("🚀 Backend is running successfully on Render!");
});

app.use("/api/auth", authRoutes);

// ====== Database Connection ======
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ====== Start Server ======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
