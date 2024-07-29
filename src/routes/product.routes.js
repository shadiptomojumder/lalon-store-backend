import { Router } from "express";
import {
    CreateProduct,
    DeleteProducts,
    GetAllProducts,
    GetSingleProduct,
    UpdateProduct,
} from "../controllers/product.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
// Public Routes
router.route("").get( verifyJWT , GetAllProducts);
router.route("/:productId").get(GetSingleProduct);


// Secured Routes
router.route("").post(verifyJWT, CreateProduct);
router.route("").delete(verifyJWT, DeleteProducts);
router.route("/:productId").patch(verifyJWT, UpdateProduct);

export default router;
