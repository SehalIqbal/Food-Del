import express from 'express';
import mongoose from 'mongoose';
import reviewModel from '../models/reviewModel.js';

const router = express.Router();

// POST endpoint for submitting a review
router.post('/', async (req, res) => {
    console.log('POST request received at /api/reviews');
    console.log('Request body:', req.body); // Log the incoming data
  
    try {
      const { foodId, userId, rating, comment } = req.body;
  
      // Check if any required field is missing
      if (!foodId || !userId || !rating) {
        console.log('Missing required fields');
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      // Check if the user has already rated this food item
      const existingReview = await reviewModel.findOne({ foodId, userId });
  
      if (existingReview) {
        console.log('User has already rated this item, updating review');
        
        // If the user has already rated, update the review instead of blocking it
        existingReview.rating = rating;
        existingReview.comment = comment;
        
        await existingReview.save();
        return res.status(200).json({ message: "Review updated successfully!" });
      }
  
      // Create a new review document if no existing review
      const newReview = new reviewModel({ foodId, userId, rating, comment });
      await newReview.save();
      console.log('Review submitted successfully');
      return res.status(201).json({ message: "Review submitted successfully!" });
      
    } catch (error) {
      console.error("Error in submitting review:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
  


router.get('/average/:foodId', async (req, res) => {
    const { foodId } = req.params; // Get the foodId from the request URL
    console.log(`GET /average/${foodId} called`);

    try {
      // Check if the foodId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(foodId)) {
        console.log('Invalid ObjectId:', foodId);
        return res.status(400).json({ error: 'Invalid foodId format' });
      }

      console.log('Fetching reviews with foodId:', foodId);

      // Find all reviews for this food item
      const reviews = await reviewModel.find({ foodId });
      console.log(`Found ${reviews.length} review(s) for foodId ${foodId}`);

      if (reviews.length === 0) {
        console.log('No reviews found, returning 0 as average');
        return res.status(200).json({ averageRating: 0 ,ratingCount: 0});
      }

      // Calculate the average rating
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      const averageRating = sum / reviews.length;
      const ratingCount = reviews.length;
      console.log(`Sum: ${sum}, Count: ${reviews.length}, Average: ${averageRating}`);

      // Return the average rating rounded to one decimal place
      return res.status(200).json({ averageRating: averageRating.toFixed(1),ratingCount:ratingCount });
    } catch (error) {
      console.error('Error calculating average rating:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/:foodId/:userId', async (req, res) => {
    console.log('GET request received at /api/reviews/:foodId/:userId');
    console.log('Request params:', req.params); // Log the incoming parameters
  
    try {
      const { foodId, userId } = req.params;
      const review = await reviewModel.findOne({ foodId, userId });
  
      if (review) {
        console.log('Review found for this user');
        return res.status(200).json({ hasRated: true });
      } else {
        console.log('No review found for this user');
        return res.status(200).json({ hasRated: false });
      }
    } catch (error) {
      console.error("Error checking rating status:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });

  export default router;