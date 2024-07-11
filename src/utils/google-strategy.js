import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import GenerateToken from "./GenerateToken.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:5000/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            //console.log("Profile :", profile);
            try {
                // Check if the user already exists in the database
                const existingUser = await User.findOne({ email: profile._json.email });
                if (existingUser) {
                    const {accessToken , refreshToken} = await GenerateToken(existingUser._id);
                    console.log("existingUser is:",existingUser);

                    const newUser = await User.findById(existingUser._id).select("-password -refresh-token");

                    return done(null, {newUser , accessToken});
                } else {
                    // User doesn't exist, create a new user
                    const lastSixDegitsId = profile.id.substring(profile.id.length - 6);
                    const lastTwoAlphabetName = profile.id.substring(profile._json.name.length - 2);
                    const newPassword = lastSixDegitsId + lastTwoAlphabetName;

                    const user = await User.create({
                        fullname: profile._json.name,
                        email: profile._json.email,
                        avatar: profile._json.picture,
                        password: newPassword,
                        googleId: profile.id
                    })

                    const newUser = await User.findById(user._id).select("-password -refresh-token") 

                    const {accessToken , refreshToken} = await GenerateToken(newUser._id)

                    // console.log("newUser created:", newUser);
                    // console.log("accessToken created:", accessToken);
                    // console.log("refreshToken created:", refreshToken);

                    return done(null, {newUser , refreshToken , accessToken});
                }
                
                
            } catch (error) {
                return done(error)
            }
        }
    )
);
