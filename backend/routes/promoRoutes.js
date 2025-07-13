// routes/promoRoute.js
import express from "express";
import PromoCode from "../models/PromoCode.js";

const router = express.Router();

// Add new promo code
router.post("/", async (req, res) => {
  const { code, discount } = req.body;

  // Check if the promo code or discount is missing
  if (!code || !discount) {
    return res.status(400).json({ success: false, message: "Promo code and discount are required." });
  }

  // Check if promo code already exists
  const existingPromoCode = await PromoCode.findOne({ code });
  if (existingPromoCode) {
    return res.status(400).json({ success: false, message: "Promo code already exists." });
  }

  // Create the promo code and save it
  const newPromoCode = new PromoCode({ code, discount });

  try {
    await newPromoCode.save();
    res.status(201).json({ success: true, message: "Promo code added successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "An error occurred while adding the promo code." });
  }
});

// Get all promo codes
router.get("/", async (req, res) => {
  try {
    const promoCodes = await PromoCode.find();
    console.log("🔥 Promo codes fetched from DB:", promoCodes);
    res.status(200).json({ success: true, promoCodes });
  } catch (error) {
    console.error("❌ Error fetching promo codes:", error);
    res.status(500).json({ success: false, message: "Error fetching promo codes." });
  }
});

router.delete("/:id", async (req, res) => {
  console.log("Received DELETE request for ID:", req.params.id);  // Log the request
  try {
    const { id } = req.params;
    const deletedPromo = await PromoCode.findByIdAndDelete(id);
    if (deletedPromo) {
      res.status(200).json({ success: true, message: "Promo code deleted successfully." });
    } else {
      res.status(404).json({ success: false, message: "Promo code not found." });
    }
  } catch (error) {
    console.error("Error deleting promo code:", error);
    res.status(500).json({ success: false, message: "Error deleting promo code." });
  }
});

router.post("/apply", async (req, res) => {
  console.log("🟢 Applying promo code:", req.body);  // This should log the promo code

  const { promoCode } = req.body;

  if (!promoCode) {
    return res.status(400).json({ success: false, message: "Promo code is required." });
  }

  try {
    const code = await PromoCode.findOne({ code: promoCode.trim() });
    console.log("🔥 Promo code found:", code);  // This will log the promo code found in the DB

    if (!code) {
      return res.status(404).json({ success: false, message: "Invalid promo code." });
    }

    return res.status(200).json({ success: true, discount: code.discount });
  } catch (err) {
    console.error("❌ Error applying promo code:", err);
    res.status(500).json({ success: false, message: "Error applying promo code." });
  }
});

export default router;
