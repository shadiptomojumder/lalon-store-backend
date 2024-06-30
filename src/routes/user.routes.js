import { Router } from "express";
import {
    changeCurrentPassword,
    deleteUser,
    generateOtp,
    getAllUser,
    getCurrentUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    resetPassword,
    updateUser,
    updateUserAvatar,
    updateUserCoverImage,
    verifyOtp,
    verifyUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);
router.route("/verify-user").post(verifyUser);
router.route("/generateOTP").post(generateOtp); // generate random OTP
router.route("/verifyOTP").post(verifyOtp); // verify generated OTP
router.route("/resetPassword").post(resetPassword);

// Secured Routes
router.route("").get(verifyJWT, getAllUser);

router.route("/:id").delete(verifyJWT, deleteUser);

router.route("/:id").patch(verifyJWT, updateUser);

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT, changeCurrentPassword);

router.route("/current-user").get(verifyJWT, getCurrentUser);

router
    .route("/update-avatar")
    .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

router
    .route("/update-coverImage")
    .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

export default router;
