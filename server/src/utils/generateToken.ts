import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { HydratedDocument } from "mongoose";
import { IUser } from "../models/User";

export const generateToken = async (user: HydratedDocument<IUser>) => {
  const secretKey = process.env.JWT_SECRET as string;
  const expiresIn = "7d";
   console.log("User type:", user.__t) // Debugging line
  const token = jwt.sign(
    { 
      userId: user._id,
      userRole: user.__t
    },
    secretKey,
    { expiresIn }
  );

  return token;
};
