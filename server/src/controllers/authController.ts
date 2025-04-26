import { Request, Response } from "express";  
import { HydratedDocument } from "mongoose";
import User, { IUser } from "../models/User";
import pharmacist from "../models/pharmacist";
import dotenv from "dotenv";
import Joi from "joi";
dotenv.config();
import sendMailService from "../services/sendEmail.js";
import { generateToken } from "../utils/generateToken";
import ExceptionClass from "../utils/ExceptionClass";
import bcrypt from "bcryptjs";
export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required"
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Password must be at least 6 characters long",
      "any.required": "Password is required"
    })
  });
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const { error } = loginSchema.validate({ email, password });
        if (error) {
          throw new ExceptionClass(error.details[0].message, "VALIDATION_ERROR", 400);
        }
      const user: HydratedDocument<IUser> | null = await User.findOne({ email });
      if (!user) {
        throw new ExceptionClass("User not found", "USER_NOT_FOUND", 404);
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new ExceptionClass("Invalid password", "INVALID_PASSWORD", 401);
      }
  
      if (user.__t === "pharmacist") {
        const pharm = await pharmacist.findById(user._id).exec();
        if (pharm?.status !== "accepted") {
          throw new ExceptionClass("Pharmacist not accepted", "PHARMACIST_NOT_ACCEPTED", 403);
        }
      }
  
      const token = await generateToken(user);
      res.cookie("authorization", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
      });
  
      res.status(200).json({ token, type: user.__t, userId: user._id });
    } catch (error) {
      console.error(error);
      if (error instanceof ExceptionClass) {
         res.status(error.statusCode).json({ message: error.message });
         return
      }
      res.status(500).json({ message: "Internal server error" });
    }
  };
  

export const logout = async (req: Request, res: Response) => {
    res.clearCookie("authorization");
     res.status(200).json({ message: "Logout Successful" });
     return
};

// export const changePassword = async (req: Request, res: Response) => {
//     const newPasswordHash = req.body.newPasswordHash;
//     const oldPassswordHash = req.body.oldPasswordHash;

//     const token = req.cookies.authorization;
//     const decodedToken = TokenUtils.decodeToken(token); // TODO handle verification before decoding

//     try {
//         const user = await User.findById(decodedToken?.userId);
//         if (!user) {
//              res.status(404).json({ message: "User not found" });
//              return
//         }
//         if (user.password != oldPassswordHash) {
//              res.status(401).json({ message: "wrong password" });
//              return
//         }
//         user.password = newPasswordHash;
//         await user.save();
//     } catch (error) {
//         console.error(error);
//          res.status(401).json({ message: "Unauthorized - Invalid token signature" });
//          return
//     }

//      res.status(200).json({ message: "changed password succesfully" });
//      return
// };

// export const requestPasswordReset = async (req: Request, res: Response) => {
//     const email: string = req.body.email.toLowerCase();
//     console.log("email", email);

//     try {
//         const user: HydratedDocument<IUser> | null = await User.findOne({ email });
//         console.log("user", user);
//         if (!user) {
//              res.status(404).json({ message: "User not found" });
//              return
//         }

//         const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
//             expiresIn: "5m"
//         });

//         const subject = "Password Reset Token";
//         const html = `<p>Click the following link to reset your password: <a href="http://localhost:3001/auth/resetpassword?token=${token}">Reset Password</a></p>`;

//         sendMailService.sendMail(email, subject, html);
//         res.status(200).json({ message: "Password reset token sent successfully" });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };

// export const resetPasswordWithToken = async (req: Request, res: Response) => {
//     const token = req.body.token;
//     const newPasswordHash = req.body.newPassword;

//     try {
//         const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET as string);

//         if (!decodedToken) {
//              res.status(401).json({ message: "Invalid or expired token" });
//              return
//         }

//         const user = await User.findById(decodedToken?.userId);
//         if (!user) {
//              res.status(404).json({ message: "User not found" });
//         }
//         user.password = newPasswordHash;
//         await user.save();

//          res.status(200).json({ message: "Password reset successfully" });
//          return
//     } catch (error) {
//         console.error(error);
//          res.status(401).json({ message: "Invalid or expired token" });
//          return
//     }
// };

// export const redirect = async (req: Request, res: Response) => {
// 	const token = req.body.authorization;
// 	try {
// 		console.log("token", token);
//         const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET as string);
// 		console.log("decodedToken", decodedToken);
//         if (!decodedToken) {
//              res.status(401).json({ message: "Invalid or expired token" });
//              return
//         }

//         const user = await User.findById(decodedToken?.userId);
// 		console.log("hereeee", user);
//         if (!user) {
//              res.status(404).json({ message: "User not found" });
//              return
//         }
// 		res.cookie("authorization", token, {
// 			httpOnly: true, // Make the cookie accessible only via HTTP (not JavaScript)
// 			secure: false
// 		});
//          res.status(200).json({"type": user.__t, "userId": user._id});
//          return
//     } catch (error) {
//         console.error(error);
//          res.status(401).json({ message: "Invalid or expired token" });
//          return
//     }
// }

