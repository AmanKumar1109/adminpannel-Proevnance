import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  const token = req.cookies.token;

  try {
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "get current user error form middleware" });
  }
};

export default isAuth;
