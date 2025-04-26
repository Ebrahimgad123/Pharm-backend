import express from "express";
import bodyParser from "body-parser";
import { ListAllAdmins, registerAdminstrator, deleteAdmin } from "../controllers/adminstratorController";
import { verifyToken } from "../middleware/verifyTokens";
import { checkPermission } from "../middleware/userRole";

const router = express.Router();
router.use(bodyParser.json());

// Get all admins => Admin only
router.get("/", verifyToken, checkPermission("administrators", "read"), ListAllAdmins);

// Create admin => Admin only
router.post("/", verifyToken, checkPermission("administrators", "create"), registerAdminstrator);

// Delete admin => Admin only
router.delete("/:id", verifyToken, checkPermission("administrators", "delete"), deleteAdmin);

export default router;
