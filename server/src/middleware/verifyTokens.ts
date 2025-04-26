import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();

export interface TokenPayload {
  userId: string;
  userRole: "PATIENT" | "PHARMACIST" | "ADMINISTRATOR" ;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
     res.status(401).json({ message: "Access token missing or invalid" });
     return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, secret) as TokenPayload;
     console.log("Decoded token:", decoded.userRole); // Debugging line
    req.user = decoded;   
    next();
  } catch (err) {
     res.status(403).json({ message: "Token is not valid or expired" });
     return
  }
};
