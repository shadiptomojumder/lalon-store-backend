import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const GetAllOrder = asyncHandler(async (req, res) => {
    try {
     const orderList = await Order.find().sort({ createdAt: -1 });

     console.log("orderList is:",orderList);
     

        return res
            .status(201)
            .json(
                new ApiResponse(
                    200,
                    orderList,
                    "Order List retrieved successfully"
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





export {GetAllOrder}