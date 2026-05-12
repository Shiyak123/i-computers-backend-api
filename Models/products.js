import mongoose from "mongoose";
const productSchema = new mongoose.Schema( //👉 This is like a blueprint👉 It defines: (field names,data types,rules (required, default, etc.))

    {
        productId: {
            type: String,
            unique: true,
            required: true
        },
        name: {
            type: [String],
            unique: true

        },
        alternativeName: {
            type: [],
            default: [],
            required: true
        },
        description: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true

        },
        labelPrice: { // discount
            type: Number,
            required: true
        },
        image: {
            type: [String],
            default: ["/default-product-1.png", "/default-product-2.png"],
            required: true
        },
        isAvailable: {
            type: Boolean,
            required: true,
            default: true
        },
        category: {
            type: String,
            required: false
        },
        stock: {
            type: Number,
            required: true,
            default: 0
        },
        brand: {
            type: String,
            required: false
        },
        model: {
            type: String,
            reqired: false

        }

    }
)
const Product = mongoose.model("product", productSchema)//This creates a MongoDB collection called:products
export default Product