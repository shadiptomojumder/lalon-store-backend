import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Base64ToFileConverter from "../utils/Base64ToFileConverter.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const CreateProduct = asyncHandler(async (req, res) => {
    try {
        const {
            productName,
            productPrice,
            productQuantity,
            productCategory,
            productDescription,
        } = req.body;
        console.log("The data is:", req.body);

        let productImageUrl = "";
        if (!productImageUrl && req.body.productImage) {
            const productImagePath = Base64ToFileConverter(
                req.body.productImage,
                "./public/temp/categoryImage.jpg"
            );
            const productImageUpload = await uploadOnCloudinary(
                String(productImagePath)
            );
            productImageUrl = productImageUpload.url;
        }
        // Here i check if any field are empty
        let productImageOneUrl = "";
        if (!productImageOneUrl && req.body.productImageOne) {
            const productImageOnePath = Base64ToFileConverter(
                req.body.productImageOne,
                "./public/temp/categoryImage.jpg"
            );
            const productImageOneUpload = await uploadOnCloudinary(
                String(productImageOnePath)
            );
            productImageOneUrl = productImageOneUpload.url;
        }
        // Here i check if any field are empty
        let productImageTwoUrl = "";
        if (!productImageTwoUrl && req.body.productImageTwo) {
            const productImageTwoPath = Base64ToFileConverter(
                req.body.productImageTwo,
                "./public/temp/categoryImage.jpg"
            );
            const productImageTwoUpload = await uploadOnCloudinary(
                String(productImageTwoPath)
            );
            productImageTwoUrl = productImageTwoUpload.url;
        }
        // Here i check if any field are empty
        let productImageThreeUrl = "";
        if (!productImageThreeUrl && req.body.productImageThree) {
            const productImageThreePath = Base64ToFileConverter(
                req.body.productImageThree,
                "./public/temp/categoryImage.jpg"
            );
            const productImageThreeUpload = await uploadOnCloudinary(
                String(productImageThreePath)
            );
            productImageThreeUrl = productImageThreeUpload.url;
        }

        // Here i check if any field are empty
        if (
            [
                productName,
                productPrice,
                productQuantity,
                productCategory,
                productDescription,
            ].some((field) => field.trim() === "")
        ) {
            throw new ApiError(400, "Fill all the fields");
        }
        // Check if the product already exists
        const productExist = await Category.findOne({
            $or: [{ productName }],
        });

        if (productExist) {
            throw new ApiError(409, "Product already exist");
        }

        // Here i create product in database
        const product = await Product.create({
            productName,
            productPrice,
            productQuantity,
            productCategory,
            productDescription,
            productImage: productImageUrl,
            productImageOne: productImageOneUrl,
            productImageTwo: productImageTwoUrl,
            productImageThree: productImageThreeUrl,
        });

        if (!product) {
            throw new ApiError(
                500,
                "Something went worng when creating product"
            );
        }

        return res
            .status(201)
            .json(new ApiResponse(200, product , "Product create successfully"));
    } catch (error) {
        console.log(error.message);
    }
});



const getCategory = asyncHandler(async (req, res) => {
    //sorting category by creeated date
    const categoryList = await Category.find().sort({ createdAt: -1 });

    // console.log("Request data by",appointmentList);

    return res
        .status(201)
        .json(new ApiResponse(200, categoryList, "Category List  Get success"));
});

export { CreateProduct, getCategory };
