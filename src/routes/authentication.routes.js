import { Router } from "express";
import passport from "passport";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = Router();

router.get("/google/failed", (req, res) => {
    console.log("Faild route on");
    
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
            //successRedirect: `${process.env.FORNTEND_HOST}`,
            failureRedirect: `${process.env.FORNTEND_HOST_live}/login`,
        }),
        (req, res) => {
            console.log("The op Request:", req.user);
            const  {newUser , accessToken } = req.user;
            const refreshToken = newUser?.refreshToken

            console.log("accessToken line 38:",accessToken);
            console.log("refreshToken line 39:",refreshToken);

            const options = {
                httpOnly: true,
                secure: true,
                sameSite: 'None',
                domain: `${process.env.FORNTEND_HOST_live}`,
                maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
            };
        
            // res.cookie("accessToken", accessToken, options);
            // res.cookie("refreshToken", refreshToken, options);

            // const userParam = encodeURIComponent(JSON.stringify(newUser));
            // return res.redirect(`${process.env.FORNTEND_HOST}/?user=${userParam}`);
            return res
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .redirect(`${process.env.FORNTEND_HOST_live}`)
        }
    );

export default router;
