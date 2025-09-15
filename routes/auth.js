// import express from "express";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// const router = express.Router();

// // Signup
// router.post("/register", async (req, res) => {
//   try {
//     const { name, phone, email, password } = req.body;

//     // check existing
//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(400).json({ msg: "User already exists" });

//     // hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new User({
//       name,
//       phone,
//       email,
//       password: hashedPassword,
//     });

//     await newUser.save();

//     res.status(201).json({ msg: "User registered successfully" });
//   } catch (err) {
//     res.status(500).json({ msg: "Server error", error: err.message });
//   }
// });

// // Login
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ msg: "Invalid credentials" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

//     const token = jwt.sign(
//       { id: user._id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.json({
//       token,
//       user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
//     });
//   } catch (err) {
//     res.status(500).json({ msg: "Server error", error: err.message });
//   }
// });

// export default router;


// backend/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// helper to sign token
function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// === Signup (local) ===
router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 12);
    const user = new User({ name, email, phone, password: hashed, provider: "local" });
    await user.save();

    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// === Login (local) ===
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    // If user created via Google only (no password), instruct them to use Google login
    if (!user.password) return res.status(400).json({ message: "Please login with Google" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid email or password" });

    const token = signToken(user._id);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// === Google Login ===
// The frontend sends the Google ID token (credential). We verify it here.
router.post("/google", async (req, res) => {
  try {
    const { token } = req.body; // token === ID token from Google (credential)
    if (!token) return res.status(400).json({ message: "No token provided" });

    // Verify the id token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, email_verified, name, picture } = payload;

    if (!email || !email_verified) {
      return res.status(400).json({ message: "Google account email not verified" });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // If user exists but isn't linked to Google yet, link the account
      if (!user.googleId) {
        user.googleId = googleId;
        user.provider = "google";
        user.avatar = picture || user.avatar;
        await user.save();
      }
    } else {
      // Create new user for Google sign-in
      user = new User({
        name: name || email.split("@")[0],
        email,
        phone: "",
        password: null,
        provider: "google",
        googleId,
        avatar: picture || null,
      });
      await user.save();
    }

    // Issue JWT and return user
    const jwtToken = signToken(user._id);
    res.json({ token: jwtToken, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
  } catch (err) {
    console.error("Google auth failed:", err);
    res.status(500).json({ message: "Google authentication failed", error: err.message });
  }
});

export default router;
