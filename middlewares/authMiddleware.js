import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
export const authenticationToken = (req, res, next) => {
    console.log(req.header("Authorization"))
  const token = req.header("Authorization")?.split(" ")[1];
//   console.log(token)
  if (!token)
    return res.status(401).json({
      message: "Access Denied"
    });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //adds user details from jwt to the request.user
    req.user = decoded;
    next(); //moves to next middleware or controller
  } catch (error) {
    res.status(403).json({
      error,
      message: "Invalid token"
    });
  }
};