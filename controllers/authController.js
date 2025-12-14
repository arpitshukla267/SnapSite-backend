// controllers/authController.js
import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * Create a signed JWT for a user id
 */
const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/**
 * SIGNUP controller
 */
export const signup = async (req, res) => {
  try {
    const { name, username, email, phone, password, confirmPassword } = req.body ?? {};

    // Basic validation
    if (!name || !username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Invalid input types" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check existing user by email OR username
    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existing) {
      // Tell user which field conflicts (avoid leaking too much, but helpful feedback)
      if (existing.email === email.toLowerCase()) {
        return res.status(400).json({ message: "Email already in use" });
      }
      return res.status(400).json({ message: "Username already in use" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      username,
      email: email.toLowerCase(),
      phone,
      password: hashed,
    });

    // Create token
    const token = createToken(user._id);

    // Prepare safe user object (omit password)
    const safeUser = {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(201).json({ message: "Account created", token, user: safeUser });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Server error creating account" });
  }
};

/**
 * LOGIN controller
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    const token = createToken(user._id);

    const safeUser = {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({ message: "Login success", token, user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error during login" });
  }
};
