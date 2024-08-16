import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const GetAllOrder = asyncHandler(async (req, res) => {
    try {
        const orderList = await Order.find().sort({ createdAt: -1 });

        console.log("orderList is:", orderList);

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

const updateSingleOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const requestedOrderId = id;

    const updateData = {}; // Initialize an empty object for updates

    // Check for each field in the request body and add it to updateData
    const fieldsToUpdate = ["deliveryAddress", "deliveryStatus"]; // Replace with your actual field names

    fieldsToUpdate.forEach((field) => {
        if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
        }
    });

    const updatedOrder = await Order.findByIdAndUpdate(
        requestedOrderId,
        { $set: updateData },
        { new: true }
    );

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                updatedOrder,
                "Single Order update Get success"
            )
        );
});

export { GetAllOrder, updateSingleOrder };
