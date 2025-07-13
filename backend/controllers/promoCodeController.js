// backend/controllers/promoCodeController.js
import PromoCode from '../models/PromoCode.js';

// Create a new promo code
export const createPromoCode = async (req, res) => {
  const { code, discount } = req.body;

  try {
    const newPromoCode = new PromoCode({ code, discount });
    await newPromoCode.save();
    res.status(201).send('Promo code created successfully');
  } catch (error) {
    res.status(400).send('Error creating promo code: ' + error.message);
  }
};

// Update an existing promo code
export const updatePromoCode = async (req, res) => {
  const { promoCodeId } = req.params;
  const { code, discount, active } = req.body;

  try {
    const updatedPromoCode = await PromoCode.findByIdAndUpdate(
      promoCodeId,
      { code, discount, active },
      { new: true }
    );
    if (!updatedPromoCode) {
      return res.status(404).send('Promo code not found');
    }
    res.status(200).send('Promo code updated successfully');
  } catch (error) {
    res.status(400).send('Error updating promo code: ' + error.message);
  }
};

// Delete a promo code
export const deletePromoCode = async (req, res) => {
  const { promoCodeId } = req.params;

  try {
    const deletedPromoCode = await PromoCode.findByIdAndDelete(promoCodeId);
    if (!deletedPromoCode) {
      return res.status(404).send('Promo code not found');
    }
    res.status(200).send('Promo code deleted successfully');
  } catch (error) {
    res.status(400).send('Error deleting promo code: ' + error.message);
  }
};

// Get all promo codes
export const getPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.find();
    res.status(200).json(promoCodes);
  } catch (error) {
    res.status(400).send('Error fetching promo codes: ' + error.message);
  }
};
