const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const SECRET_KEY = crypto.randomBytes(32).toString("hex"); // For demo only; use env var in production

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing)
    return res.status(400).json({ message: "Email already exists" });

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashed });
  await user.save();

  res.status(201).json({ message: "User created" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ token, user: { id: user._id, name: user.name } });
});

module.exports = router;
