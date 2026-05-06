import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import sendMail from "../config/mail.js";


export const googleAuth = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(200).json({ message: "User already exists", user });
    }
    const newUser = await User.create({
      name,
      email,
      avatar,
    });
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      message: "User created successfully",
      user: newUser,
      token: token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error logging out", error: error.message });
  }
};


export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const { name, registerid } = req.body;
   
   
    await sendMail(email, name, registerid);
    return res.status(200).json({ message: "Otp sent successfully" });
  } catch (error) {
    console.log("Error during sending otp:", error);
    res.status(500).json({ message: "otp server error", error });
  }
};