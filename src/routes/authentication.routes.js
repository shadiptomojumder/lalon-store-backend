import { Router } from "express";
import passport from "passport";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = Router();

router.get("/google/failed", (req, res) => {
    throw new ApiError(401, "Failed to authenticate with Google");
})

router.get("/google/success", (req, res) => {
    throw new ApiError(401, "Google authentication Success");
})

router
    .route("/google")
    .get(
        passport.authenticate("google", { scope: ["profile","email"], session: false })
    );

router
    .route("/google/callback")
    .get(
        passport.authenticate("google", {
            session: false,
            failureRedirect: `${process.env.FORNTEND_HOST}/login`,
        }),
        (req, res) => {
            console.log("The op Request:",req.user);
            const  {newUser , refreshToken , accessToken } = req.user;
            const loggedInUser = newUser;

            const options = {
                httpOnly: false,
                secure: true,
                sameSite: 'None',
                maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
            };
        
            res.cookie("accessToken", accessToken, options);
            res.cookie("refreshToken", refreshToken, options);

            const userParam = encodeURIComponent(JSON.stringify(newUser));
            return res.redirect(`${process.env.FORNTEND_HOST}/?user=${userParam}`);
        }
    );

export default router;
