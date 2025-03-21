import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "15d" });
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const registerUser = async (req, res) => {
  const { password } = req.body;
  const username = req.body.username?.trim().toLowerCase() || "";
  const email = req.body.email?.trim().toLowerCase() || "";

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  if (username.length < 3) {
    return res.status(400).json({
      success: false,
      message: "Username must be at least 3 characters",
    });
  }

  const userNameExists = await userModel.findOne({ username });
  if (userNameExists) {
    return res
      .status(400)
      .json({ success: false, message: "Username already exists" });
  }

  const emailExists = await userModel.findOne({ email });
  if (emailExists) {
    return res
      .status(400)
      .json({ success: false, message: "Email already exists" });
  }

  try {
    //get random profile image
    const profileImage = `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`;

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create user
    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
      profileImage,
    });

    //generate token
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
      token,
    });
  } catch (error) {
    console.error("Error in Register user", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const loginUser = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase() || "";
  const password = req.body.password;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
      token,
    });
  } catch (error) {
    console.error("Error in Login user", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export { registerUser, loginUser };
