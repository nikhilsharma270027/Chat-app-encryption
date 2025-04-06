import dotenv from "dotenv";
dotenv.config(); // ✅ Load .env variables
import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../Schemas/User.js";
import fetchUser from "../config/fetchUser.js";

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET;

// creating user signing up
router.post(
  "/createUser",
  [
    body("name", "Please enter name").notEmpty(),
    body("email", "Please enter valid email").isEmail(),
    body("password", "Please enter valid password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      const userExists = await User.findOne({ email: req.body.email });
      if (userExists) {
        return res.send({ error: [{ msg: "User already exists" }] });
      }

      const salt = await bcrypt.genSalt(10);
      const encryptedPass = await bcrypt.hash(req.body.password, salt);

      const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: encryptedPass,
      });

      const data = { userId: user._id };
      const authToken = jwt.sign(data, jwtSecret);
      console.log(authToken)
      return res.send({ error: false, authToken });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// logging in user
router.post(
  "/login",
  [
    body("email", "Please enter valid email").isEmail(),
    body("password", "Please enter valid password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.send({
          error: true,
          message: "Please enter valid login credentials",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.send({
          error: true,
          message: "Please enter valid login credentials",
        });
      }

      const data = { userId: user._id };
      const authToken = jwt.sign(data, jwtSecret);

      return res.send({ authToken });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// fetching logged-in user
router.get("/getUser", fetchUser, async (req, res) => {
  try {
    const userId = req.user;
    const user = await User.findById(userId).select("-password");

    if (user) {
      return res.send(user);
    }

    return res.status(401).send("Please enter valid login credentials");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
