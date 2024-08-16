import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
    {
        productName: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        productPrice: {
            type: Number,
            required: true,
            trim: true,
            index: true,
        },
        productQuantity: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        productCategory: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        productDescription: {
            type: String,
            trim: true,
        },
        productStock: {
            type: Number,
            default:0
        },
        productImage: {
            type: String,
        },
        productImageOne: {
            type: String,
        },
        productImageTwo: {
            type: String,
        },
        productImageThree: {
            type: String,
        },
        // createdBy: {
        //     type: Schema.Types.ObjectId,
        //     ref: "User",
        // },
    },
    {
        timestamps: true,
    }
);

export const Product = mongoose.model("product", productSchema);
