import express from "express";
//hash passwords before storing in DB
import bcrypt from "bcryptjs";
//generate jwt token for authentication
import jwt from "jsonwebtoken";
import User from "../models/user.js";

//create a new express router
const authRouter = express.Router();

// register user API ("/api/auth/register")

authRouter.post("/register", async (req, res) => {
  try {
    //extract user details from request body
    const { name, email, password } = req.body;
    //hash password for security
    const hashedPassword = await bcrypt.hash(password, 10);
    //create a new user instance
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    //save user to database
    await user.save();
    res.status(201).json({status:201, message: "User Registered Successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ Error: "Registeration failed", message: err.message });
  }
});

//login API using findOne, bcrypt.compare

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      email,
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        error: "Invalid Credentials",
      });
    }
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.TOKEN_EXPIRY,
      }
    );
    res.status(200).json({
      status: 200,
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ Error: "Login failed" });
  }
});

export default authRouter;
