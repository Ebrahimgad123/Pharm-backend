import { Request, Response } from "express";
import adminstrator from "../models/Adminstrator";
import Pharmacist from "../models/pharmacist";
import ExceptionClass from "../utils/ExceptionClass";
import bcrypt from "bcryptjs";
import Joi from "joi";

export const registerAdminSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(8).required(),
  email: Joi.string().email().required(),
});

export const registerAdminstrator = async (req: Request, res: Response) => {
    try {
      const { error, value } = registerAdminSchema.validate(req.body);
  
      if (error) {
        throw new ExceptionClass(error.details[0].message, "validation_error", 400);
      }
  
      const { email, password, username } = value;
       const existingUsername = await adminstrator.findOne({ username });
        if (existingUsername) {
            throw new ExceptionClass("Username or email already exists", "username", 400);   
        }   
      const existingAdmin = await adminstrator.findOne({ email });
      if (existingAdmin) {
        throw new ExceptionClass("username Email already exists", "email", 400);
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create new admin
      const newAdmin = await adminstrator.create({
        username,
        email,
        password: hashedPassword,
        role: "ADMINISTRATOR"
      });
  
      res.status(201).json({message: "Administrator registered successfully",newAdmin});
  
    } catch (err: any) {
      console.error("Error registering administrator:", err) 
        res.status(500).json({ message: "Server error", error: err.message });
      }
    }

//done  

    export const deleteAdmin = async (req: Request, res: Response) => {
        try {
          const id = req.params.id;
      
          const deletedAdmin = await adminstrator.findByIdAndDelete(id);
      
          if (!deletedAdmin) {
            throw new ExceptionClass("Admin not found", "ADMIN_NOT_FOUND", 404);
          }
      
          res.status(200).json({message: "Admin deleted successfully",deletedAdmin});
      
        } catch (err: any) {
            res.status(500).json({ message: "Server error", error: err.message });
          }
        }
//done

export const ListAllAdmins = async (req: Request, res: Response) => {
    adminstrator
        .find({})
        .then((results) => {
            res.status(200).send(results);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
};
//done
export const acceptPharmacistRequest = async (req: Request, res: Response) => {
    // assuming pharmacist id passed as a parameter whenever entry is clciked from fe
    const reqid = req.body.id;
    // assuming his initial state is pending because I only get to see pending requests

    const update = {
        // Define the fields you want to update and their new values
        status: "accepted"
    };

    // Set options for the update
    const options = {
        new: true // Return the updated document after the update
    };

    // Use findOneAndUpdate to find and update the document
    const filter = { _id: reqid };
    Pharmacist.findOneAndUpdate(filter, update, options)
        .then((result) => {
            res.status(200).send("accepted");
        })
        .catch((err) => res.status(404).send(err));
};

export const rejectPharmacistRequest = async (req: Request, res: Response) => {
    // assuming pharmacist id passed as a parameter whenever entry is clciked from fe
    const reqid = req.body.id;
    // assuming his initial state is pending because we only see pending pharmacists

    const update = {
        // Define the fields you want to update and their new values
        status: "rejected"
    };

    // Set options for the update
    const options = {
        new: true // Return the updated document after the update
    };

    // Use findOneAndUpdate to find and update the document
    const filter = { _id: reqid };
    Pharmacist.findOneAndUpdate(filter, update, options)
        .then((result) => {
            res.status(200).send("rejected");
        })
        .catch((err) => res.status(404).send(err));
};

export const deletePharmacist = async (req: Request, res: Response) => {
    //delete a pharmacist
    const id = req.params.id;
    const pharm = Pharmacist.findByIdAndDelete({ _id: id })
        .then((pharm) => {
            res.status(200).send(pharm);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
};