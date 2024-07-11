import { Category } from "../models/category.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Base64ToFileConverter from "../utils/Base64ToFileConverter.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";






const InitGoogleAuthentication = asyncHandler( async (req, res) => {
    try {
        passport.authenticate('google', { scope: ['profile'], session: false })
        
    } catch (error) {
        console.log(error);
    }
})

export { InitGoogleAuthentication , };
