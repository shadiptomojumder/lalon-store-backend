import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { paymentInit, paymentSuccess } from "../controllers/payment.controller.js";




const router = Router();

router.route("").post(paymentInit)
router.route("/success/:tranId").post(paymentSuccess)













export default router;