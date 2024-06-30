import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { CreateProduct } from "../controllers/product.controller.js";

const router = Router();



router.route("").post(CreateProduct);








export default router;