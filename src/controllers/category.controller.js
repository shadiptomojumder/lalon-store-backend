import { Category } from "../models/category.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Base64ToFileConverter from "../utils/Base64ToFileConverter.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";




const CreateCategory = asyncHandler(async (req, res) => {
    try {
        const { categoryName, categoryImage } = req.body;
        console.log("The data is:", req.body);

        let categoryImageUrl = "";
        // If avatar is not found in form data, check if it is present in the request body
        if (!categoryImageUrl && req.body.categoryImage) {
            const categoryImagePath = Base64ToFileConverter(req.body.categoryImage,"./public/temp/categoryImage.jpg");
            console.log("categoryImagePath 144 is",categoryImagePath);
            const avatarUpload = await uploadOnCloudinary(String(categoryImagePath));
            categoryImageUrl = avatarUpload.url
        }

        // Here i check if any field are empty
        if ([categoryName,categoryImage].some((field) => field.trim() === "")) {
            throw new ApiError(400, "all field are requered");
        }
        // Check if category already exists
        const categoryExist = await Category.findOne({
            $or: [{ categoryName }],
        });

        if (categoryExist) {
            throw new ApiError(409, "Category already exist");
        }

        const category = await Category.create({
            categoryName,
            categoryImage: categoryImageUrl,
        });



        return res
        .status(201)
        .json(new ApiResponse(200, category, "Category create successfully"));


    } catch (error) {
        console.log(error.message);
    }
});

const getCategory = asyncHandler( async (req, res) => {
    
    //sorting category by creeated date 
    const categoryList = await Category.find().sort({ createdAt: -1 })

    // console.log("Request data by",appointmentList);

    return res.status(201).json(
        new ApiResponse(200, categoryList , "Category List  Get success")
    )
})

export { CreateCategory , getCategory };
