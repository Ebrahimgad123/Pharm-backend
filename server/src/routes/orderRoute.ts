import express from "express";
import bodyParser from "body-parser";
import {viewOrders,addOrder,cancelOrder,viewSales,} from "../controllers/orderController";
const router = express.Router();

router.use(bodyParser.json());

router.get("/salesreport", viewSales);
router.get("/:patientId", viewOrders);
router.post("/:patientId/add", addOrder);
router.put("/:orderId",cancelOrder);

export default router;
