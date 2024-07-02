import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { CreateProduct, GetAllProduct } from "../controllers/product.controller.js";

const router = Router();



router.route("").post(CreateProduct);
router.route("").get(GetAllProduct);








export default router;