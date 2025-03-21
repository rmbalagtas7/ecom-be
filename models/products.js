const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema(
    {
        productName: {
            type: String,
            required: true
        },
        productDescription: {
            type: String,
            required: true
        },
        price: {
            type: String,
            required: true,
            min: 0
        },
        stock: {
            type: Number,
            min: 0
        },
        productImages: [
            {
                url: { type: String, required: true},
                altText: { type: String, default: "" }
            }
        ],
        category: {
            type: String,
            required: true,
            enum: ["Earings", "Rings", "Necklaces", "Bracelets"],
            default: "Other"
        },
        reviews: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
                comment: { type: String, required: true },
                rating: { type: Number, required: true, min: 0, max: 5 },
                createdAt: { type: Date, default: Date.now() }
            }
        ],
        
    },
    { timestamp: true }
);


module.exports = mongoose.model('Products', schema);