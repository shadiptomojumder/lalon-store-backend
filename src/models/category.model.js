import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
    {
        categoryName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        categoryImage: {
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

export const Category = mongoose.model("category", categorySchema);
