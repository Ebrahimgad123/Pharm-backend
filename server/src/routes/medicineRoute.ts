import express from "express";
import bodyParser from "body-parser";
import {
  listAllMedicines,
  listMedicines,
  readMedicine,
  searchMedicineByName,
  filterMedicines,
  createMedicine,
  updateMedicine,
  archiveMedicine,
} from "../controllers/medicineController";
import { verifyToken } from "../middleware/verifyTokens";
import { checkPermission } from "../middleware/userRole";

const router = express.Router();
router.use(bodyParser.json());



// GET
router.get("/viewAll", verifyToken, checkPermission("medicines", "read"), listAllMedicines);
router.get("/view", checkPermission("medicines", "read"), listMedicines);
router.get("/", checkPermission("medicines", "read"), readMedicine);
router.get("/search", checkPermission("medicines", "read"), searchMedicineByName);
router.post("/filter", checkPermission("medicines", "read"), filterMedicines);

// POST
router.post("/", verifyToken, checkPermission("medicines", "create"), createMedicine);

// PUT
router.put("/:id", verifyToken, checkPermission("medicines", "update"), updateMedicine);
router.put("/:id/archive", verifyToken, checkPermission("medicines", "update"), archiveMedicine);

export default router;
