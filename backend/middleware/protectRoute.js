import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const protectRoute = async (req, res, next) => {
  const { token } = req.headers;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "User not Authenticated" });
  }
  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(token_decode.id).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Token is not valid" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Token is Invalid or Expired" });
  }
};

export default protectRoute;
