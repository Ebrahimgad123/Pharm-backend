import express from "express";
import bodyParser from "body-parser";
import {listAllMedicines,listMedicines,readMedicine,searchMedicineByName,filterMedicines,createMedicine,updateMedicine,archiveMedicine} from "../controllers/medicineController";

const router = express.Router();
router.use(bodyParser.json());



//GET
router.get("/viewAll", listAllMedicines);
router.get("/view", listMedicines);
router.get("/", readMedicine);
router.get("/search", searchMedicineByName);
router.post("/filter", filterMedicines);

//POST
router.post("/", createMedicine);

//PUT
router.put("/:id", updateMedicine);
router.put("/:id/archive", archiveMedicine);

export default router;
