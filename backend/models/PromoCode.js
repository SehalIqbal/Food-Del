// models/PromoCode.js
import mongoose from "mongoose";

const promoCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true, // Ensures promo code is unique
  },
  discount: {
    type: Number,
    required: true,
    min: 1,  // Minimum discount is 1
    max: 100, // Maximum discount is 100
  },
});

const PromoCode = mongoose.model("PromoCode", promoCodeSchema);

export default PromoCode;
