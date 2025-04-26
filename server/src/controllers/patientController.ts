import { Request, Response,NextFunction} from "express";
import patient from "../models/Patient";
import Users from "../models/User";
import Cart from "../models/Cart"
import pharmacist from "../models/pharmacist";
import ExceptionClass from "../utils/ExceptionClass";
import { patientRegistrationSchema } from "../validation/patientSchema";
import bcrypt from "bcryptjs";
export const registerPatient = async (req: Request, res: Response) => {
    try {
        
        const { error } = patientRegistrationSchema.validate(req.body, {
          abortEarly: false,
        });
        if (error) {
            const errors = error.details.map((e) => e.message);

            throw new ExceptionClass(errors.join(" | "), "VALIDATION_ERROR", 400, );
          }

      const { username, email, password, mobileNumber } = req.body;
      const existingUsername = await Users.findOne({ username});
      if (existingUsername) {
        throw new ExceptionClass("Username already taken", "USERNAME_TAKEN", 400);
      }
      const existingEmail = await patient.findOne({ email });
      if (existingEmail) {
        throw new ExceptionClass("Email already taken", "EMAIL_TAKEN", 400);
      }
        const existingNationalId = await patient.findOne({ nationalId: req.body.nationalId });
        if (existingNationalId) {       
            throw new ExceptionClass("National ID already taken", "NATIONAL_ID_TAKEN", 400);
        }
      const hashedPassword = await bcrypt.hash(password, 10);
      req.body.password = hashedPassword;
      req.body.wallet = 0;
      const newPatient = await patient.create(req.body);
  
      await Cart.create({
        patient: newPatient._id,
        medicines: [],
      });
  
       res.status(200).json(newPatient);
       return
  
    } catch (err) {
      if (err instanceof ExceptionClass) {
         res.status(err.statusCode).json({ message: err.message, code: err.errorCode });
         return
      }
  
      // Handle other errors (e.g., database errors)
      console.error(err);
       res.status(500).json({ message: "Something went wrong." });
       return
    }
  }
  //done

export const listPatients = async (req: Request, res: Response) => {
  patient
        .find()
        .then((results) => {
            res.status(200).send(results);
        })
        .catch((err) => {
            res.status(404).send(err);
        });
};
//done
export const getPatientById = async (req: Request, res: Response,next:NextFunction) => {
    const id = req.params.id; 

    try {
        const pat = await Users.findOne({ _id: id }) 
            .select("username email passwordHash dateOfBirth gender mobileNumber emergencyContact package");

        if (!pat) {
            throw new ExceptionClass("Patient not found", "PATIENT_NOT_FOUND", 404);
        }

        console.log(pat);
        res.status(200).send(pat); 
    } catch (err) {
      next(err)
    }
}
//done

export const viewPatientInfo = async (req: Request, res: Response) => {
    const id = req.params.id; 
    try {
        const pat = await patient.findOne({ _id: id }).select({});
        if (!pat) {
          throw new ExceptionClass("Patient not found", "PATIENT_NOT_FOUND", 404);
        }
        res.status(200).json(pat);

    } catch (err) {
        res.status(500).json({ message: "Error fetching patient info", error: err });
    }
};
//done

export const deletePatient = async (req: Request, res: Response) => {
    const id = req.params.id; 

    try {
        const pat = await patient.findByIdAndDelete(id);
        if (!pat) {
           throw new ExceptionClass("Patient not found", "PATIENT_NOT_FOUND", 404);
        }
        res.status(200).json(pat);

    } catch (err) {
        res.status(400).json({ message: "Error deleting patient", error: err });
    }
};
//done

export const viewAddresses = async (req: Request, res: Response) => {
    const patientId = req.params.patientId;
    try {
        const p = await patient.findOne({ _id: patientId });

        if (!p) {
             res.status(404).json({ message: "Patient not found" });
             return
        }

        const addresses = p.address;
        res.status(200).json({ addresses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
// add address to the patient  push adress to the array of addresses in the patient model
export const addAddress = async (req: Request, res: Response) => {
    const patientId = req.params.patientId;
    const newAddress = req.body.newAddress;
    try {
        const existingPatient = await patient.findOne({ _id: patientId });
        if (!existingPatient) {
             res.status(404).json({ message: "Patient not found" });
             return
        }
        existingPatient.address?.push(newAddress);
        await existingPatient.save();
        res.json({ message: 'Address added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
//still under development
export const chatWithPharmacists = async (req: Request, res: Response) => {
    const pId = req.params.id;
    const search = req.params.search;

    if (!search) {
       throw new ExceptionClass("Search term is required", "SEARCH_TERM_REQUIRED", 400);
    }

    try {
        const all: any[] = await pharmacist.find({});
        if (all.length === 0) {
           throw new ExceptionClass("No pharmacists found", "NO_PHARMACISTS_FOUND", 404);
        }
        const pharmacists = all.filter(pharmacist => 
            pharmacist?.name?.toLowerCase().includes(search.toLowerCase())
        );
      
        if (pharmacists.length === 0) {
        throw new ExceptionClass("No pharmacists found", "NO_PHARMACISTS_FOUND", 404);
        }
        // console.log(pharmacists);  
         res.status(200).send(pharmacists);
         return

    } catch (err) {
         res.status(500).send("Error occurred while fetching pharmacists.");
        return;
    }
};


// still under development
  export const getAllMyPharmacists = async (req: Request, res: Response) => {
    try {
        const all = await pharmacist.find({});

        if (all.length === 0) {
           throw new ExceptionClass("No pharmacists found", "NO_PHARMACISTS_FOUND", 404);
        }

        res.status(200).json(all);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving pharmacists", error: err });
    }
};
