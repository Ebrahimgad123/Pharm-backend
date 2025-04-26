import mongoose, { Schema, model } from "mongoose";
import User from "./User";

interface IPharmacist {
    dateOfBirth: Date;
    hourlyRate: number;
    affiliation: string;
    education: string;
    files: document[];
    status: string;
    wallet?: number;
}

interface document {
    filename: string;
    path: string;
}

const pharmacistShema = new Schema<IPharmacist>({
    dateOfBirth: { type: Date, required: true },
    hourlyRate: { type: Number, required: true },
    affiliation: { type: String, required: true, trim: true },
    education: { type: String, required: true, trim: true },
    files: [
        {
            filename: { type: String, required: true, trim: true },
            path: { type: String, required: true, trim: true }
        }
    ],
    status: { type: String, required: true, lowercase: true, enum: ["pending", "accepted", "rejected"] },
    wallet: { type: Number, required: false }
});

const pharmacist = User.discriminator<IPharmacist>("PHARMACIST", pharmacistShema);

export default pharmacist;
