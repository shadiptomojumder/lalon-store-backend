import { Router } from "express";
import {
    paymentInit,
    paymentSuccess,
} from "../controllers/payment.controller.js";

const router = Router();

router.route("").post(paymentInit);
router.route("/success/:tranId").post(paymentSuccess);

export default router;
