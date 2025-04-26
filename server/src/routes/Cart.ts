import express from "express";
import bodyParser from "body-parser";
import {
  addMedicineToCart,
  viewCart,
  removeMedicineFromCart,
  changeAmountofMedicineInCart,
  emptyCart,
} from "../controllers/cartController";
import { verifyToken } from "../middleware/verifyTokens";
import { checkPermission } from "../middleware/userRole";

const router = express.Router();

router.use(bodyParser.json());

router.get("/:patientId",verifyToken,checkPermission("cart", "read", (req) => req.params.patientId),viewCart);

router.post("/:patientId/add",verifyToken,checkPermission("cart", "create", (req) => req.params.patientId),addMedicineToCart);

router.delete("/:patientId/:medName",verifyToken,checkPermission("cart", "delete", (req) => req.params.patientId),removeMedicineFromCart);

router.post("/:patientId/changeAmount",verifyToken,checkPermission("cart", "update", (req) => req.params.patientId),changeAmountofMedicineInCart);

router.put("/:patientId/empty",verifyToken,checkPermission("cart", "delete", (req) => req.params.patientId),emptyCart);

export default router;
