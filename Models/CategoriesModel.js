import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
    {
        name: {
            type: String,
            require: true,
        },
    },
    {
        timestamps: true,
    }
)

const Categories = mongoose.model("Categories", categorySchema);

export default Categories;