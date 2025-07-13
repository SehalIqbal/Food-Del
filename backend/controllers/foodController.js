import foodModel from "../models/foodModel.js";
import fs from 'fs';

// all food list
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        res.json({ success: true, data: foods });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

// add food
const addFood = async (req, res) => {
    try {
        let image_filename = `${req.file.filename}`;

        // Ensure that stock is included in the request body
        const { name, description, price, category, stock } = req.body;

        const food = new foodModel({
            name,
            description,
            price,
            category,
            image: image_filename,
            stock,  // Include stock here
        });

        await food.save();
        res.json({ success: true, message: "Food Added" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

// delete food
const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        fs.unlink(`uploads/${food.image}`, () => { });

        await foodModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Food Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

// Update Stocks
const updateStock = async (req, res) => {
    try {
        const { id, stock, price } = req.body;

        const updateFields = {};
        if (stock !== undefined) updateFields.stock = stock;
        if (price !== undefined) updateFields.price = price;

        const food = await foodModel.findByIdAndUpdate(id, updateFields, { new: true });

        if (!food) {
            return res.json({ success: false, message: "Food item not found" });
        }

        res.json({ success: true, message: "Item updated successfully", data: food });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating item" });
    }
};


export { listFood, addFood, removeFood, updateStock };
