import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);



//config variables
const currency = "usd";
const deliveryCharge = 5;
const frontend_URL = 'http://localhost:5173';

// Placing User Order for Frontend using Stripe
const placeOrder = async (req, res) => {
    try {
        const { discount, amount, userId, items, address } = req.body;

        // Check for required fields
        if (!amount || !userId || !items || !address) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        console.log("Discount Sent to Backend:", discount);

        // Final amount after discount
        const finalAmount = amount;

        // Save the order
        const newOrder = new orderModel({
            userId,
            items,  // Array of items with prices and quantities
            amount: finalAmount,  // Final amount after discount
            address,
            discount: discount || 0,  // Optionally store the discount amount
            payment: "stripe"  // Payment method can be passed dynamically based on frontend
        });

        // Reduce the stock for each ordered item
        for (let item of items) {
            console.log("🔍 Finding food with ID:", item.foodId);
            const foodItem = await foodModel.findById(item.foodId);
            console.log("🍔 Result:", foodItem);

            if (!foodItem) {
                return res.status(404).json({ message: `Food item not found for ID: ${item.foodId}` });
            }

            // Check if the stock is sufficient
            if (foodItem.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Not enough stock for ${foodItem.name}` });
            }

            // Reduce the stock
            foodItem.stock -= item.quantity;
            await foodItem.save();
        }

        // Save the order
        await newOrder.save();
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        // Stripe session creation (line items for Stripe)
        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100  // Stripe expects the amount in cents
            },
            quantity: item.quantity
        }));

        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: "Delivery Charge"
                },
                unit_amount: deliveryCharge * 100  // Delivery charge (in cents)
            },
            quantity: 1
        });

        const session = await stripe.checkout.sessions.create({
            success_url: `${frontend_URL}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_URL}/verify?success=false&orderId=${newOrder._id}`,
            line_items: line_items,
            mode: 'payment',
        });

        console.log("Stripe session created:", session.url); // ✅ See if it was created

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.error("❌ Stripe session creation failed:", error.message || error);
        res.status(500).json({
            success: false,
            message: "Stripe session creation failed",
            error: error.message || error
        });
    }
};

const placeOrderCod = async (req, res) => {
    try {
        const { discount, amount, userId, items, address } = req.body;

        console.log("discount:", discount);
        console.log("amount:", amount);
        console.log("userId:", userId);
        console.log("items:", items);
        console.log("address:", address);

        // Check for required fields
        if (
            discount === undefined || discount === null ||
            amount === undefined || amount === null ||
            !userId || !items || !address
        ) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const finalAmount = amount;

        // Save the order with COD payment
        const newOrder = new orderModel({
            userId,
            items,  // Save individual item details (price, quantity, etc.)
            amount: finalAmount,  // Final amount after discount
            address,
            payment: "cod",  // Payment method is COD
            discount: discount || 0  // Optionally store the discount amount
        });

        // Reduce the stock for each ordered item
        for (let item of items) {
            console.log("🔍 Finding food with ID:", item.foodId);
            const foodItem = await foodModel.findById(item.foodId);
            console.log("🍔 Result:", foodItem);

            if (!foodItem) {
                return res.status(404).json({ message: `Food item not found for ID: ${item.foodId}` });
            }

            // Check if the stock is sufficient
            if (foodItem.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Not enough stock for ${foodItem.name}` });
            }

            // Reduce the stock
            foodItem.stock -= item.quantity;
            await foodItem.save();
        }

        // Save the order
        await newOrder.save();
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.json({ success: true, message: "Order Placed with COD" });

    } catch (error) {
        console.error("Error placing COD order:", error);
        res.status(500).json({ success: false, message: "Error placing COD order" });
    }
};



// Listing Orders for Admin panel
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ success: false, message: "Error fetching orders" });
    }
};

// User Orders for Frontend
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ success: false, message: "Error fetching user orders" });
    }
};

// Update Order Status (Admin)
const updateStatus = async (req, res) => {
    console.log(req.body);
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ success: false, message: "Error updating status" });
    }
};

// Verify Order Payment (Frontend)
const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body; // Log the body of the request
    console.log("Received data:", { orderId, success });

    if (!orderId || success === undefined) {
        return res.status(400).json({ success: false, message: "Missing required body parameters" });
    }

    try {
        if (success) {
            await orderModel.findByIdAndUpdate(orderId, { payment: stripe });
            res.json({ success: true, message: "Paid" });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Not Paid" });
        }
    } catch (error) {
        console.error("Error verifying order:", error);
        res.status(500).json({ success: false, message: "Error verifying order" });
    }
};

export { placeOrder, listOrders, userOrders, updateStatus, verifyOrder, placeOrderCod };
