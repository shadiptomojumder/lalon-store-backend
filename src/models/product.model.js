import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
    {
        productName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        productPrice: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        productQuantity: {
            type: String,
            required: true,
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
            required: true,
            trim: true,
            index: true,
        },
        productImage: {
            type: String,
            index: true,
        },
        productImageOne: {
            type: String,
            index: true,
        },
        productImageTwo: {
            type: String,
            index: true,
        },
        productImageThree: {
            type: String,
            index: true,
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
