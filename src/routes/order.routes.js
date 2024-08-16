import { Router } from "express";
import { GetAllOrder, updateSingleOrder } from "../controllers/order.controller.js";


const router = Router();

router.route("").get(GetAllOrder);
router.route("/:id").patch(updateSingleOrder);

export default router;