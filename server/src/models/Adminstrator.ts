import mongoose, { Schema, model } from "mongoose";
import User from "./User";

interface IAdminstrator {
    // username:string;
    // passwordHash: string;
}

const adminstratorSchema = new Schema<IAdminstrator>({
    // username: { type: String, required: true , unique: true },
    // passwordHash:{ type: String, required: true },
});

// const Adminstrator = model<IAdminstrator>('Adminstrator', adminstratorSchema);
const Adminstrator = User.discriminator<IAdminstrator>("ADMINISTRATOR", adminstratorSchema);

export default Adminstrator;
