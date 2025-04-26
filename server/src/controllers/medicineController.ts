import { Request, Response } from "express";
import medicine from "../models/medicine";

export const listAllMedicines = async (req: Request, res: Response) => {
    try {
      const results = await medicine.find({});
      res.status(200).send(results);
    } catch (err) {
      res.status(500).send("Server error while listing medicines.");
      console.error(err);
    }
  };
  
export const listMedicines = async (req: Request, res: Response) => {
    try {
      const medicinesList = await medicine
        .find()
        .select('_id availableQuantity name medicinalUse image price details overTheCounter isArchived');
  
      const medResults = medicinesList.map(med => ({
        _id: med._id,
        name: med.name,
        medicinalUse: med.medicinalUse,
        image: med.image,
        price: med.price,
        details: med.details,
        overTheCounter: med.overTheCounter,
        isArchived: med.isArchived,
        stock: med.availableQuantity,
      }));
  
      res.status(200).send(medResults);
    } catch (err) {
      res.status(404).send(err);
    }
  };
  

export const readMedicine = async (req: Request, res: Response) => {
    try {
        const meds = await medicine.find().select("name availableQuantity sales");
        const medResults = meds.map(med => ({
            name: med.name,
            availableQuantity: med.availableQuantity,
            sales: med.sales,
        }));
        res.status(200).send(medResults);
    } catch (err) {
        res.status(404).send(err);
    }
};

export const searchMedicineByName = async (req: Request, res: Response) => {
    const { name } = req.body;
  
    if (!name) {
       res.status(400).send("Missing 'name' in request body.");
         return
    }
  
    try {
      const meds = await medicine.find({
        name: { $regex: new RegExp(name, "i") }
      });
  
      if (meds.length === 0) {
         res.status(404).send("No medicines found with this name.");
            return
      }
  
      res.status(200).json(meds);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error while searching medicines.");
    }
  };
  

export const filterMedicines = async (req: Request, res: Response) => {
    try {
      const { medicinalUse } = req.body;
  
      if (!medicinalUse) {
         res.status(400).send("Missing 'medicinalUse' in request body.");
         return
      }
  
      const results = await medicine.find({ medicinalUse });
  
      if (results.length === 0) {
         res.status(404).send("No medicines found under this medicinal use.");
         return
      }
  
      res.status(200).json(results);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error while filtering medicines.");
    }
  };
  

  export const createMedicine = async (req: Request, res: Response) => {
    try {
      let { overTheCounter, availableQuantity } = req.body;
  
      if (overTheCounter == null) {
        overTheCounter = false;
      }
  
      if (availableQuantity == null || availableQuantity <= 0) {
         res.status(400).send("Cannot add medicine with 0 or negative available quantity.");
            return
      }
  
      const newMedicine = await medicine.create({
        ...req.body,
        overTheCounter,
      });
  
      res.status(200).send(newMedicine);
    } catch (error) {
      console.error(error);
      res.status(500).send("Failed to create medicine.");
    }
  };
  
  export const updateMedicine = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const query = { _id: id };
      const { details, price } = req.body;
      const update: { [key: string]: any } = {};
  
      if (details !== undefined) update.details = details;
      if (price !== undefined) update.price = price;
  
      if (Object.keys(update).length === 0) {
         res.status(400).send("No fields provided for update.");
            return
      }
  
      const updatedMed = await medicine.findOneAndUpdate(query, update, { new: true });
  
      if (!updatedMed) {
         res.status(404).send("Medicine not found.");
            return
      }
  
      res.status(200).send(updatedMed);
    } catch (error) {
      console.error(error);
      res.status(500).send("Failed to update medicine.");
    }
  };
  
export const archiveMedicine = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const existingMedicine = await medicine.findById(id);
        if (!existingMedicine) {
             res.status(404).send({ message: "Medicine not found" });
             return;
        }
        existingMedicine.isArchived = !existingMedicine.isArchived;
        const updatedMed = await existingMedicine.save();
        res.status(200).send(updatedMed);
    } catch (error) {
        res.status(400).send(error);
    }
};
