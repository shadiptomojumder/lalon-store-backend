import mongoose, { Schema ,Types } from "mongoose";

const orderSchema = new Schema(
    {
        userId: {
            type: Types.ObjectId,
            required: true,
        },
        username: {
            type: String,
            required: true,
            lowercase: true,
        },
        deliveryAddress: {
            type: String,
            required: true,
            lowercase: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        productIds: {
            type: [Schema.Types.ObjectId],
            ref: "Product",
            required: true,
        },
        totalAmmount: {
            type: Number,
            required: true,
        },
        transactionId: {
            type: String,
        },
        deliveryStatus: {
            type: String,
            default: "pending",
        },
        paymentStatus: {
            type: Boolean,
            default: false,
        },
        paymentType: {
            type: String,
            default: "online",
        },
    },
    {
        timestamps: true,
    }
);

export const Order = mongoose.model("order", orderSchema);
