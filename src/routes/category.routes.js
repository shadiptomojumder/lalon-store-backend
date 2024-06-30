import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { CreateCategory, getCategory } from "../controllers/category.controller.js";

const router = Router();



// Secured Routes
router.route("").post(CreateCategory);
router.route("").get(getCategory);

// router.route("/:id").delete(verifyJWT, deleteUser);

// router.route("/:id").patch(verifyJWT, updateUser);









export default router;