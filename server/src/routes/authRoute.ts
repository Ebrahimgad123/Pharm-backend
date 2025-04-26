import express from "express";
import bodyParser from "body-parser";
import {login,logout} from "../controllers/authController";
const router = express.Router();
router.use(bodyParser.json());

router.post("/login", login); // Correct
router.post("/logout", logout); // Correct
// router.post("/reset", requestPasswordReset);
// router.post("/resetwithtoken", resetPasswordWithToken);
// // router.post("/change", changePassword);
// router.post("/redirect", redirect);


export default router;
