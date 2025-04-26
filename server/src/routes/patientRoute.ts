import express from "express";
import bodyParser from "body-parser";
import {
  registerPatient,
  listPatients,
  getPatientById,
  deletePatient,
  viewAddresses,
  addAddress,
  chatWithPharmacists,
  getAllMyPharmacists,
  viewPatientInfo
} from "../controllers/patientController";

import { verifyToken } from "../middleware/verifyTokens";
import { checkPermission } from "../middleware/userRole";

const router = express.Router();
router.use(bodyParser.json());

router.post("/", registerPatient);

// delete patient => Admin & patient (own)
router.delete("/:id",verifyToken,checkPermission("patients", "delete"),deletePatient);

// LIST all patients => Admin & Pharmacist
// done
router.get("/",verifyToken,checkPermission("patients", "read"),listPatients);

// View addresses => role-based, possibly own (we assume address belongs to patientId)
router.get("/address/:patientId",verifyToken,checkPermission("patients", "read", (req) => req.params.patientId),viewAddresses);

// Add address => ADMIN or PATIENT (own)
router.put("/address/:patientId",verifyToken,checkPermission("patients", "update", (req) => req.params.patientId),addAddress);

// Chat with pharmacists => Patient (own)
router.get("/chatWithPharmacists/:id/:search",verifyToken,checkPermission("patients", "read", (req) => req.params.id),chatWithPharmacists);

// Get all my pharmacists => Patient (own)
router.get("/getAllMyPharmacists/:id",verifyToken,checkPermission("patients", "read", (req) => req.params.id),getAllMyPharmacists);

// View patient info => depends on scope
router.get("/:id/info",verifyToken,checkPermission("patients", "read", (req) => req.params.id),viewPatientInfo);

// Get patient by ID => Admin & Pharmacist & Patient (own)
// done
router.get("/:id",verifyToken,checkPermission("patients", "read", (req) => req.params.id),getPatientById);

export default router;
