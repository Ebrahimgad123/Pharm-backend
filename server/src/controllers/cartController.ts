import { Request, Response } from "express";
import carts from "../models/Cart";
import medicine, { Imedicine } from "../models/medicine";
import { HydratedDocument } from "mongoose";

export const addMedicineToCart = async (req: Request, res: Response) => {
    const { medName, medPrice, medQuantity } = req.body;
    const patientId = req.params.patientId;
    try {
        const cart = await carts.findOne({ patient: patientId });
        if (!cart) {
             res.status(404).json({ message: "Cart not found" });
             return
        }
        const existingMedicine = cart.medicines.find((med) => med.medName === medName);
        const med: HydratedDocument<Imedicine> | null = await medicine.findOne({ name: medName });
        if (!med) {
             res.status(404).send("medicine not found");
             return
        }

        if (existingMedicine) {
            if (existingMedicine.medQuantity + medQuantity > med.availableQuantity) {
                 res.status(400).send("Not enough stock");
                 return
            }
            existingMedicine.medQuantity += medQuantity;
        } else {
            if (medQuantity > med.availableQuantity) {
                 res.status(400).send("Not enough stock");
                 return
            }
            const newMedicine = {
                medName,
                medPrice,
                medQuantity
            };
            cart.medicines.push(newMedicine);
        }
        await cart.save();
        res.json({ message: "Medicine added to cart successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const viewCart = async (req: Request, res: Response) => {
    const patientId = req.params.patientId;
    carts
        .find({ patient: patientId })
        .then((results) => {
            res.status(200).send(results[0]);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
};

export const removeMedicineFromCart = async (req: Request, res: Response) => {
    const medName = req.params.medName;
    const patientId = req.params.patientId;
    try {
        const cart = await carts.findOne({ patient: patientId });
        if (!cart) {
             res.status(404).json({ message: "Cart not found" });
             return
        }

        const updatedMedicines = cart.medicines.filter((med) => med.medName !== medName);
        await carts.findOneAndUpdate({ patient: patientId }, { medicines: updatedMedicines }, { new: true });
        res.json({ message: "Medicine removed from cart successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const changeAmountofMedicineInCart = async (req: Request, res: Response) => {
    const { medName, newAmount } = req.body;

    const patientId = req.params.patientId;
    console.log(medName + " " + newAmount);
    console.log(patientId);
    try {
        const cart = await carts.findOne({ patient: patientId });
        if (!cart) {
             res.status(404).json({ message: "Cart not found" });
             return
        }

        const existingMedicine = cart.medicines.find((med) => med.medName === medName);
        if (existingMedicine) {
            if (newAmount > 100) {
                 res.status(400).send("Quantity cannot be more than 100.");
                 return
            } else if (newAmount < 1) {
                 res.status(400).send("Quantity cannot be less than 1.");
                 return
            } else {
                const med: HydratedDocument<Imedicine> | null = await medicine.findOne({ name: medName });
                if (!med) {
                     res.status(404).send("medicine not found");
                     return
                }
                if (med.availableQuantity < newAmount) {
                     res.status(400).send("No more stock");
                     return
                }
                existingMedicine.medQuantity = Number(newAmount);
            }
        } else {
             res.status(404).json({ message: "Medicine not found in cart" });
             return
        }
        await cart.save();
        res.json({ message: "Medicine quantity updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const emptyCart = async (req: Request, res: Response) => {
    const patientId = req.params.patientId;
    try {
        const cart = await carts.findOne({ patient: patientId });
        if (!cart) {
             res.status(404).json({ message: "Cart not found" });
             return
        }
        cart.medicines = [];
        await cart.save();
        res.json({ message: "Cart emptied successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

