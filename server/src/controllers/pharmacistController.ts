import { Request, Response } from "express";
import Pharmacist from "../models/pharmacist";
import axios from "axios";
import CircularJSON from 'circular-json';
import Joi from "joi";
import ExceptionClass from "../utils/ExceptionClass";
const pharmacistSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    dateOfBirth: Joi.date().required(), 
    hourlyRate: Joi.number().required(), 
    affiliation: Joi.string().required(), 
    education: Joi.string().required(), 
    files: Joi.array().items(
        Joi.object({
            filename: Joi.string().required(),
            path: Joi.string().required(),
        })
    ).optional(),
});
  
  export const registerPharmacist = async (req: Request, res: Response) => {
    try {
        const dataToServer = req.body;

        const { error } = pharmacistSchema.validate(dataToServer);
        if (error) {
            throw new ExceptionClass(error.details[0].message, "validation_error", 400);
        }

        const existingUsername = await Pharmacist.findOne({ username: dataToServer.username });
        if (existingUsername) {
            throw new ExceptionClass("Username already registered, please sign in.", "username", 400);
        }

        const existingEmail = await Pharmacist.findOne({ email: dataToServer.email });
        if (existingEmail) {
            throw new ExceptionClass("Email already registered, please sign in.", "email", 400);
        }

        dataToServer.wallet = 0;
        dataToServer.status = "pending";

        const files = req.files as Express.Multer.File[];
        if (files) {
            const documents = files.map((file) => ({
                filename: file.originalname,
                path: file.path,
            }));
            dataToServer.files = documents;
        }

        const newPharmacist = await Pharmacist.create(dataToServer);
        res.status(201).json(newPharmacist);
    } catch (err: any) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
  };

export const listPharmacistRequests = async (req: Request, res: Response) => {
    //view all of the information uploaded by a pharmacist (with pending requests) to apply to join the platform
    Pharmacist.find({ status: { $in: ["pending", "rejected"] } })
        .then((pharm) => {
            res.status(200).send(pharm);
        })
        .catch((err) => {
            res.status(400).send(err);
            console.log(err);
        });
};

export const acceptPharmacist = async (req: Request, res: Response) => {
    //accepting a pharmacist's request
    const id = req.params.id;
    const query = { _id: id };
    const pharm = await Pharmacist.findById({ _id: id })
        .then((pharm) => {
            const update: { [key: string]: any } = {};
            if (pharm!.status === "pending") update["status"] = "accepted";
            Pharmacist.findOneAndUpdate(query, update, { new: true }).then((updatedPharm) => {
                if (updatedPharm) {
                    res.status(200).send(updatedPharm);
                }
            });
        })
        .catch((error) => {
            res.status(400).send(error);
        });
};

export const listPharmacists = async (req: Request, res: Response) => {
    //view all of the information uploaded by a pharmacist (with approved requests) to select one of them to view his info
    const pharm = Pharmacist.find({})
        .then((pharm) => {
            var newPharms = [];
            for (var i = 0; i < pharm.length; i++) {
                if (pharm[i].status === "accepted") newPharms.push(pharm[i]);
            }

            res.status(200).json(newPharms);
        })
        .catch((err) => {
            res.status(400).json(err);
        });
};

export const readPharmacist = async (req: Request, res: Response) => {
    //view a pharmacist's information
    const id = req.params.id;
    const pharm = Pharmacist.findById(id)
        .then((pharm) => res.status(200).json(pharm))
        .catch((err) => {
            res.status(400).json(err);
        });
};

export const listAllPharmacists = async (req: Request, res: Response) => {
    //view a pharmacist's information
    Pharmacist.find({})
        .then((pharm) => res.status(200).json(pharm))
        .catch((err) => {
            res.status(400).json(err);
        });
};

export const deletePharmacist = async (req: Request, res: Response) => {
    //remove a pharmacist from the system
    const id = req.params.id;
    const pharm = Pharmacist.findByIdAndDelete({ _id: id })
        .then((pharm) => {
            res.status(200).json(pharm);
        })
        .catch((err) => {
            res.status(400).json(err);
        });
};

export const chatWithContacts = async (req: Request, res: Response) => {
  
  const search = req.params.search;

  
  if (!search) res.status(400).send("No search text.");

  else if(search!==undefined && search!==null && typeof search == "string") {
      const all:any [] = (await axios.get("http://localhost:8000/doctors")).data;
      console.log("Response doctors: "+all);
      const docs: any[] = [];
      for (const doc of all) {

      if((doc?.name)?.includes(search)) docs.push(doc);
      }
      console.log(docs);
      res.status(200).send(docs);
  }

};


export const getAllMyContacts = async (req: Request, res: Response) => {
  

      const all:any [] = await axios.get("http://localhost:8000/doctors");

      console.log(all);
      res.status(200).send(CircularJSON.stringify(all));

};




