import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: "food", required: true },
  userId: { type: String, required: true }, // or mongoose.ObjectId if you're referencing users
  username: { type: String }, // optional, helpful to display
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema);
export default reviewModel;
