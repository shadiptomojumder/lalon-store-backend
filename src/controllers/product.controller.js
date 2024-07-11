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
            productImage,
            productImageOne,
            productImageTwo,
            productImageThree,
        } = req.body;
        // console.log("The data is:", req.body);

        // let productImageUrl = "";
        // if (!productImageUrl && req.body.productImage) {
        //     const productImagePath = Base64ToFileConverter(
        //         req.body.productImage,
        //         "./public/temp/categoryImage.jpg"
        //     );
        //     const productImageUpload = await uploadOnCloudinary(
        //         String(productImagePath)
        //     );
        //     productImageUrl = productImageUpload.url;
        // }
        // Here i check if any field are empty
        // let productImageOneUrl = "";
        // if (!productImageOneUrl && req.body.productImageOne) {
        //     const productImageOnePath = Base64ToFileConverter(
        //         req.body.productImageOne,
        //         "./public/temp/categoryImage.jpg"
        //     );
        //     const productImageOneUpload = await uploadOnCloudinary(
        //         String(productImageOnePath)
        //     );
        //     productImageOneUrl = productImageOneUpload.url;
        // }
        // Here i check if any field are empty
        // let productImageTwoUrl = "";
        // if (!productImageTwoUrl && req.body.productImageTwo) {
        //     const productImageTwoPath = Base64ToFileConverter(
        //         req.body.productImageTwo,
        //         "./public/temp/categoryImage.jpg"
        //     );
        //     const productImageTwoUpload = await uploadOnCloudinary(
        //         String(productImageTwoPath)
        //     );
        //     productImageTwoUrl = productImageTwoUpload.url;
        // }
        // Here i check if any field are empty
        // let productImageThreeUrl = "";
        // if (!productImageThreeUrl && req.body.productImageThree) {
        //     const productImageThreePath = Base64ToFileConverter(
        //         req.body.productImageThree,
        //         "./public/temp/categoryImage.jpg"
        //     );
        //     const productImageThreeUpload = await uploadOnCloudinary(
        //         String(productImageThreePath)
        //     );
        //     productImageThreeUrl = productImageThreeUpload.url;
        // }

        // Here i check if any field are empty
        // if (
        //     [
        //         productName,
        //         productPrice,
        //         productQuantity,
        //         productCategory,
        //         productDescription,
        //     ].some((field) => field.trim() === "")
        // ) {
        //     throw new ApiError(400, "Fill all the fields");
        // }

        // Validate required fields
        if (
            [
                productName,
                productPrice,
                productQuantity,
                productCategory,
                productDescription,
            ].some((field) =>
                typeof field === "string" ? field.trim() === "" : !field
            )
        ) {
            throw new ApiError(400, "Fill all the fields");
        }

        // Check if the product already exists
        const productExist = await Product.findOne({
            $or: [{ productName }],
        });

        if (productExist) {
            throw new ApiError(409, "Product already exist");
        }

        // Helper function to handle image uploads
        const uploadImage = async (base64Image) => {
            if (!base64Image) return "";
            const uniqueSuffix = Date.now();
            const imagePath = Base64ToFileConverter(
                base64Image,
                `./public/temp/productImage_${uniqueSuffix}.jpg`
            );
            const imageUpload = await uploadOnCloudinary(String(imagePath));
            return imageUpload.url;
        };

        // Upload product images
        const productImageUrl = await uploadImage(productImage);
        const productImageOneUrl = await uploadImage(productImageOne);
        const productImageTwoUrl = await uploadImage(productImageTwo);
        const productImageThreeUrl = await uploadImage(productImageThree);

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
            .json(new ApiResponse(200, product, "Product create successfully"));
    } catch (error) {
        console.log(error.message);
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiError(
                    error.statusCode || 500,
                    error.message || "Internal Server Error"
                )
            );
    }
});

const GetAllProducts = asyncHandler(async (req, res) => {
    try {
        //console.log("Query Parameters:",req.query);
        const search = req.query.search || "";
        const category = req.query.category || "";

        const query = {
            productName:{$regex:search,$options:"i"},
            productCategory:{$regex:category,$options:"i"},
        }
        // Fetch all products sorted by createdAt date descending
        const productList = await Product.find(query).sort({ createdAt: -1 });

        return res
            .status(201)
            .json(
                new ApiResponse(
                    200,
                    productList,
                    "Product List retrieved successfully"
                )
            );
    } catch (error) {
        console.log("error", error.message);
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiError(
                    error.statusCode || 500,
                    error.message || "Internal Server Error"
                )
            );
    }
});

const GetSingleProduct = asyncHandler(async (req, res) => {
    try {
        // Fetch all products sorted by createdAt date descending
        console.log("Request is:", req.params);
        const productId = req.params?.productId;
        // Check if productId is provided
        if (!productId) {
            return res
                .status(400)
                .json(new ApiError(400, "Product ID is required"));
        }

        const product = await Product.findById(productId);

        // Handle case where product is not found
        if (!product) {
            return res.status(404).json(new ApiError(404, "Product not found"));
        }
        console.log("Product is:", product);
        return res
            .status(201)
            .json(
                new ApiResponse(200, product, "Product retrieved successfully")
            );
    } catch (error) {
        console.log("error", error.message);
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiError(
                    error.statusCode || 500,
                    error.message || "Internal Server Error"
                )
            );
    }
});

const DeleteProducts = asyncHandler(async (req, res) => {
    try {
        const productIds = req.body; // Access IDs from request body
        console.log("The body is:", req.body);
        console.log("The productIds is:", productIds);

        if (!productIds || !productIds.length) {
            throw new ApiError(400, "Missing productIds IDs");
        }

        const deletedCount = await Product.deleteMany({
            _id: { $in: productIds },
        });
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    `Deleted ${deletedCount.deletedCount} product`
                )
            );
    } catch (error) {
        console.error("Error deleting productIds:", error);
        return res.status(500).json(new ApiError(500, "Internal server error"));
    }
});

const UpdateProduct = asyncHandler(async (req, res) => {
    try {
        const { productId } = req.params;
        const updateData = req.body;
        console.log("Product ID for update: ", productId);
        console.log("Product Data for update: ", req.body);

        // Find product by ID and update
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            updateData,
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        return res.status(200).json(new ApiResponse(200, updatedProduct, "Product retrieved successfully"));
    } catch (error) {
        console.error("Error deleting appointments:", error);
        return res.status(500).json(new ApiError(500, "Internal server error"));
    }
});

export {
    CreateProduct,
    DeleteProducts,
    GetAllProducts,
    GetSingleProduct,
    UpdateProduct,
};
