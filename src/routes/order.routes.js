import { Router } from "express";
import { GetAllOrder } from "../controllers/order.controller.js";


const router = Router();

router.route("").get(GetAllOrder);

export default router;