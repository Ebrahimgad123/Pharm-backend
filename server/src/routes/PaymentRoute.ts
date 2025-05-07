import express from "express";
import bodyParser from "body-parser";
import { payCCShoppingCart,payCashOnDelivery,payWalletShoppingCart } from "../controllers/PaymentController";
const router = express.Router();

router.use(bodyParser.json());

//POST

router.post("/shoppingCart",payCCShoppingCart);
router.post("/shoppingCart",payWalletShoppingCart);
router.post("/",payCashOnDelivery);

export default router;
