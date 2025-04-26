import mongoose, { Schema, model, connect, Types } from "mongoose";
import User from "./User";

interface emergencyContact {
  name: string;
  mobileNumber: string;
  relation: string;
}

interface familyMember {
  name: string;
  nationalId: string;
  patientId: Types.ObjectId;
  gender: string;
  relation: string;
}

interface document {
  filename: string;
  path: string;
}

interface IPatient {
  nationalId: string;
  dateOfBirth: Date;
  gender: string;
  mobileNumber: string;
  emergencyContact: emergencyContact;
  files?: document[];
  familyMembers?: familyMember[];
  revFamilyMembers?: Types.ObjectId[];
  prescriptions?: Types.ObjectId[];
  package?: Types.ObjectId;
  subscribedToPackage?: boolean;
  packageRenewalDate?: Date;
  healthRecords?: Types.ObjectId[];
  address?: string[];
  wallet?: number;
}

const PatientSchema = new Schema<IPatient>({
  nationalId: { type: String},
  dateOfBirth: { type: Date},
  gender: {type: String},
  mobileNumber: {type: String},
  emergencyContact: {
    name: { type: String},
    mobileNumber: {type: String},
    relation: {type: String},
  },
  files: [
    {
      filename: { type: String}, 
      path: { type: String},
    },
  ],
  
  familyMembers: [
      {
          name: { type: String},
          nationalId: { type: String },
          patientId: { type: Schema.Types.ObjectId, ref: "Patient"},
          gender: { type: String},
          relation: { type: String},
      }
  ],
  revFamilyMembers: [{ type: Schema.Types.ObjectId, ref: "Patient", required: false }],
  prescriptions: [
    { type: mongoose.Types.ObjectId, ref: "Prescription", required: false },
  ],
  package: { type: mongoose.Types.ObjectId, ref: "Package", required: false },
  subscribedToPackage: { type: Boolean, required: false },
  packageRenewalDate: { type: Date, required: false },
  healthRecords: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HealthRecord",
      required: false,
    },
  ],
  address: [{ type: String, required: false, trim: true }],
  wallet: { type: Number, required: false },
});

const Patient = User.discriminator<IPatient>("PATIENT", PatientSchema);

export default Patient;
