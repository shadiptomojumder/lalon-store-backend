import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"
import Base64ToFileConverter from "../utils/Base64ToFileConverter.js";
import GenerateOTP from "../utils/GenerateOTP.js";
import { sendMail } from "../utils/mailer.js";


const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false})
        
        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler( async (req,res) => {
    // Get user details from frontend
    // Validation of Data come from frontend
    // Check if user already exists
    // Check for images for avatar,coverImage
    // Upload image on cloudinary
    // Create user object - create entry on database
    // Remove password and refresh token field from response
    // Return response 
    const { fullname, email, password } = req.body;
    // Here i check if any field are empty 
    if(
        [fullname, email, password].some((field)=> field.trim() === "")
    ){
        throw new ApiError(400, "all field are requered")
    }

    const existUser = await User.findOne({
        $or: [{ fullname }, { email }]
    })

    if(existUser){
        throw new ApiError(409, "username or email already exist")
    }

    const user = await User.create({
        fullname,
        email,
        password
    })
   
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // if (!createdUser) {
    //     throw new ApiError(500, "Something went worng when registering user")
    // }

    return res.status(201).json(
        new ApiResponse(200, createdUser , "User register successfully")
    )
})

const loginUser = asyncHandler( async (req, res) => {
    // Colect data from Login Form
    // Check if user exist or not
    // If user exist then Find the user
    // Check if password is correct or not
    // If password is correct then generate refresh token
    // Return response

    const { email , password } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is requerd")
    }

    const user = await User.findOne({
        $or: [{ email }]
    })

    if (!user) {
        throw new ApiError(400, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Password is incorrect User or Password don't match!!")
    }

    const {accessToken , refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refresh-token")  

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
      };

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200,
            {
                loggedInUser,
                accessToken,
                refreshToken
            },
            "User login successfully")
    )
})

const verifyUser = asyncHandler( async (req, res) => {
    // Colect data from Login Form
    // Check if user exist or not
    // If user exist then Find the user
    // Check if password is correct or not
    // If password is correct then generate refresh token
    // Return response

    const { email  } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is requerd")
    }

    const userfound = await User.findOne({
        $or: [{ email }]
    })

    if (!userfound) {
        throw new ApiError(400, "User does not exist")
    }

    const user = await User.findById(userfound._id).select("-password -refresh-token")  


    return res
    .status(200)
    .json(
        new ApiResponse(200, user ,"User Found")
    )
})

const logoutUser = asyncHandler( async (req, res) => {
    // Remove refresh token from database
    // Remove refresh token from cookie
    // Return response

    console.log("The Request 165 line:", req);
    console.log("The Request body 166 line:", req.body);
    console.log("The Request user 166 line:", req.user);

    const UserId = req.body.userId

    await User.findByIdAndUpdate(
        UserId,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true,
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(
        new ApiResponse(200,{},"User logout successfully")
    )
})

const refreshAccessToken = asyncHandler( async (req, res)=> {
    // Get refresh token from cookie
    // Check if refresh token exist or not
    // If refresh token exist then Find the user
    // Generate access token
    // Return response
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken ;



    console.log("incomingRefreshToken by body line 200 is:",req.body.refreshToken);
    console.log("incomingRefreshToken by cookies line 201 is:",req.cookies.refreshToken);
    console.log("incomingRefreshToken line 202 is:",incomingRefreshToken);

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        console.log("come to 207 line");
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        console.log("decodedToken is:",decodedToken);

        const user = await User.findById(decodedToken?._id);
        console.log("Come here in line 217 and user is:",user);
        
        if (!user) {
            throw new ApiError(401, "Unauthorized: User not found");
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Unauthorized: Refresh token does not match");
        }
    
        const options = {
            httpOnly: true,
            secure: true,
        }

        const accessToken = user.generateAccessToken();
    
        // const {accessToken } = await generateAccessTokenAndRefreshToken(user._id);
        console.log("accessToken 229 is:",accessToken);
        // Clear old tokens
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(200,{accessToken},"Access Token Refreshed!")
        )
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid Refresh Token Error")
    }
})

const changeCurrentPassword = asyncHandler( async (req, res) => {
    // Get old password from frontend
    // Get new password from frontend
    // Check if old password is correct or not
    // If password is correct then update password
    // Return response

    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

   if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Old Password")
   }

   user.password = newPassword

   await user.save({validateBeforeSave:false})

   return res
   .status(200)
   .json(
       new ApiResponse(200,{},"Password Changed Successfully")
   )

})

const getCurrentUser = asyncHandler( async (req, res) => {
    // Get current user from database
    // Return response
    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "Current User fetched successfully")
    )
})

// const updateUser = asyncHandler( async (req, res) => {
//     // Get user details from frontend
//     // Validation of Data come from frontend
//     // Remove password 
//     // Return response

//     const { fullname, email } = req.body;

//     if (!fullname || !email) {
//         throw new ApiError(400, "All field are required")
//     }

//     const user = await User.findByIdAndUpdate(
//         req.user?._id,
//         {
//             $set: {
//                 fullname,
//                 email
//             }
//         },
//         {new: true}
//     ).select("-password")

//     return res
//     .status(200)
//     .json(
//         new ApiResponse(200, user, "User updated successfully")
//     )
// })

const updateUserAvatar = asyncHandler( async (req, res) => {
    // Get user details from frontend
    // Validation of Data come from frontend
    // Remove password 
    // Return response

    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file not found")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Error while uploading avatar on cloudinary")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new:true}
    ).select("-password")

    return res
   .status(200)
   .json(
        new ApiResponse(200, user, "Avatar updated successfully")
    )
})

const updateUserCoverImage = asyncHandler( async (req, res) => {
    // Get user details from frontend
    // Validation of Data come from frontend
    // Remove password 
    // Return response

    const coverLocalPath = req.file?.path;

    if (!coverLocalPath) {
        throw new ApiError(400, "coverLocalPath file not found")
    }

    const coverImage = await uploadOnCloudinary(coverLocalPath);

    if (!coverImage) {
        throw new ApiError(400, "Error while uploading coverImage on cloudinary")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new:true}
    ).select("-password")

    return res
   .status(200)
   .json(
        new ApiResponse(200, user, "Cover Image updated successfully")
    )
})

const generateOtp = asyncHandler( async (req, res) => {
    const otp = await GenerateOTP()
    const { email }= req.body;
    // console.log("The mail come from fornt",email);
    
    try {
        const emailResult = await sendMail({
            userEmail: email,
            text: "Your OTP for verification",
            subject: "OTP Verification",
            otp: otp
        });
        console.log("Email sent result:", emailResult.messageId);

        if(!(emailResult && emailResult.messageId)){
            throw new ApiError(400, "Error when sending OTP")
        }
        
         // Find the user and update their OTP
         const user = await User.findOne({ email });

         if (!user) {
            throw new ApiError(400, "User not found when sending OTP")
         }

         user.otp = otp; 
        await user.save();

        return res.status(200).json(
            new ApiResponse(201, { OTP: otp }, "OTP sent successfully!")
        );

    } catch (error) {
        console.error("Error sending email:", error);
        return res.status(500).json(
            new ApiResponse(500, null, "Failed to send OTP email")
        );
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,"Verify Successsfully op!")
    )
})

const verifyOtp = asyncHandler( async (req, res) => {
    const { email , otp } = req.body;
    console.log("The otp and mail fornt",otp,email);
    
    // Find the user and update their OTP
    const user = await User.findOne({ email });
    // console.log("The user:",user);
    

    if (!user) {
       throw new ApiError(400, "User not found when sending OTP")
    }

    if (user.otp!== parseInt(otp)) {
        throw new ApiError(400, "Invalid OTP")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201,"OTP Verify Successsfull")
    )
})

const resetPassword = asyncHandler( async (req, res) => {
    const { email , password } = req.body;

    
    // Find the user and update their OTP
    const user = await User.findOne({ email });
    console.log("The user:",user);
    

    if (!user) {
       throw new ApiError(400, "User not found when reset password")
    }
    

    user.otp = "";
    user.password =  password;
    await user.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Password Successsfully reset")
    )
})

const getAllUser = asyncHandler( async (req, res) => {
    const requestById = req.user._id;
    // console.log("Requext by",requestById);
    const userList = await User.find().sort({ createdAt: -1 }).select("-password -refresh-token")  

    if(!userList){
        throw new ApiError(400, "User list not found when try to get")
    }

    return res.status(201).json(
        new ApiResponse(200, userList , "User List Get success")
    )
})

const deleteUser = asyncHandler( async (req, res) => {
    const { id } = req.params;
    const requestUserId = id;
    console.log("requestUserId for delete is",requestUserId);

    try {
        const deletedUser = await User.findByIdAndDelete(requestUserId);
        if (!deletedUser) {
            return res.status(404).json(new ApiResponse(404, "User not found"));
        }
    
        // Optionally log deleted appointment details
        console.log("Deleted appointment:", deletedUser);
    
        return res.status(201).json(
            new ApiResponse(200, "User deleted successfully")
        );
    } catch (error) {
        console.error("Error deleting User:", error);
        return res.status(500).json(new ApiError(500, "Internal server error"));
    }
})

const updateUser = asyncHandler( async (req, res) => {
    const { id } = req.params;
    const requestUserId = id;
    // console.log("requestUserId is",requestUserId);
    let avatarUrl = "";
        // If avatar is not found in form data, check if it is present in the request body
        if (!avatarUrl && req.body.avatar) {
            const avatarPath = Base64ToFileConverter(req.body.avatar,"./public/temp/avatar.jpg");
            console.log("avatarPath 144 is",avatarPath);
            const avatarUpload = await uploadOnCloudinary(String(avatarPath));
            avatarUrl = avatarUpload.url
        }

    const updateData = {}; // Initialize an empty object for updates
 

    // Check for each field in the request body and add it to updateData
    const fieldsToUpdate = [
        "fullname",
        "email",
        "phone",
        "role",
        "avatar",
    ]; // Replace with your actual field names
    console.log("fieldsToUpdate",fieldsToUpdate);

    fieldsToUpdate.forEach((field) => {
        if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
    }
    });

     // Include avatar URL in updateData if it's been processed
    if (avatarUrl) {
        updateData.avatar = avatarUrl;
    }

    console.log("updateData",updateData);

    const updatedUser = await User.findByIdAndUpdate(
        requestUserId,
        { $set: updateData },
        { new: true }
    ).select("-password");

    if(!updatedUser){
        throw new ApiError(400, "User not found")
    }

    console.log("updatedUser is",updatedUser);

    return res.status(201).json(
        new ApiResponse(200 ,updatedUser, "User update Get success")
    )
})


export { generateOtp , getAllUser , deleteUser , updateUser , verifyOtp , resetPassword , registerUser , loginUser , verifyUser , logoutUser , refreshAccessToken , changeCurrentPassword ,getCurrentUser , updateUserAvatar ,updateUserCoverImage }