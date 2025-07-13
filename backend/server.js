// backend/server.js
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import userRouter from './routes/userRoute.js';
import foodRouter from './routes/foodRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import promoCodeRouter from './routes/promoRoutes.js';  // Import promo code routes
import reviewRoute from "./routes/reviewRoute.js";
import reportRouter from './routes/reportRoute.js';

import 'dotenv/config';

// App config
const app = express();
const port = process.env.PORT || 4000;

// Middlewares
app.use(express.json());
app.use(cors());

// DB connection
connectDB();

// API endpoints
app.use("/api/reviews", reviewRoute);
app.use('/api/reports', reportRouter);
app.use('/api/user', userRouter);
app.use('/api/food', foodRouter);
app.use('/images', express.static('uploads'));
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/promo', promoCodeRouter); 
app.get('/', (req, res) => {
  res.send('API Working');
});

app.listen(port, () => console.log(`Server started on http://localhost:${port}`));
