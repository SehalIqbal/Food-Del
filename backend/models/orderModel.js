import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: [
        {
            foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },  // Save price per unit
        },
    ],
    amount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    address: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipcode: { type: String, required: true },
        country: { type: String, required: true },
        phone: { type: String, required: true },
    },
    payment: { type: String, enum: ["cod", "stripe"], required: true },
    status: { type: String, default: "Food Processing" },
    date: { type: Date, default: Date.now },
});

const orderModel = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default orderModel;
