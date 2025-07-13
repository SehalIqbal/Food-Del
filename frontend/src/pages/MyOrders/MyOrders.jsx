import React, { useContext, useEffect, useState } from 'react';
import './MyOrders.css';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';
import { assets } from '../../assets/assets';

const MyOrders = () => {
  const [data, setData] = useState([]);
  const [ratings, setRatings] = useState({}); // To track selected ratings
  const [ratedItems, setRatedItems] = useState({}); // Track if item is rated
  const { url, token, currency } = useContext(StoreContext);

  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        "http://localhost:4000/api/order/userorders",
        {},
        { headers: { token } }
      );
      setData(response.data.data); // Set the orders data
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // Check if the user has already rated an item
  const checkIfRated = async (foodId, userId) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/reviews/${foodId}/${userId}`);
      return response.data.hasRated;
    } catch (error) {
      console.error('Error checking rating status:', error);
      return false;
    }
  };

  // Update selected rating value for each item
  const handleSelectChange = (foodId, value) => {
    setRatings((prev) => ({ ...prev, [foodId]: value }));
  };

  // Submit rating for a specific food item
  const handleRatingSubmit = async (foodId, rating, userId) => {
    if (!rating || rating === "0") {
      alert("Please select a valid rating.");
      return;
    }

    try {
      await axios.post("http://localhost:4000/api/reviews", {
        foodId,
        userId,
        rating,
        comment: "Good food!", // Optional
      });

      // Mark the item as rated after submission
      setRatedItems((prev) => ({ ...prev, [foodId]: true }));
      alert("Thank you for your review!");
      fetchOrders(); // Refresh orders if needed
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Failed to submit review");
    }
  };

  // Fetch orders and check if items are rated
  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]); // Only run fetchOrders when token changes

  // Polling to periodically refresh orders every 10 seconds (if needed)
  useEffect(() => {
    const interval = setInterval(() => {
      if (token) fetchOrders();
    }, 10000); // Fetch every 10 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [token]); // Dependency array to avoid unnecessary interval refresh

  useEffect(() => {
    const checkRatingsForOrders = async () => {
      const updatedRatedItems = {};
      for (const order of data) {
        for (const item of order.items) {
          const hasRated = await checkIfRated(item.foodId, order.userId);
          updatedRatedItems[item.foodId] = hasRated;
        }
      }
      setRatedItems(updatedRatedItems); // Update the rated items state
    };

    if (data.length > 0) {
      checkRatingsForOrders();
    }
  }, [data]); // Only check ratings when data is available

  // Reload order status function
  const handleReloadStatus = async (orderId) => {
    // Fetch orders again to reload the status of the specific order
    fetchOrders();
  };

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      <div className="container">
        {data.map((order, index) => (
          <div key={index} className="my-orders-order">
            <img src={assets.parcel_icon} alt="" />
            <p>
              {order.items.map((item, i) => (
                <span key={i}>
                  {item.name} x {item.quantity}
                  {i !== order.items.length - 1 && ", "}
                </span>
              ))}
            </p>
            <p>{currency}{order.amount}.00</p>
            <p>Items: {order.items.length}</p>
            <p><span>&#x25cf;</span> <b>{order.status}</b></p>

            {/* If delivered, allow rating */}
            {order.status === "Delivered" && (
              <div className="rating-container">
                {order.items.map((item) => (
                  <div key={item.foodId} className="rating-form">
                    <p>{item.name}</p>

                    {/* If item is rated, show "Rated" text and hide Reload Status button */}
                    {ratedItems[item.foodId] ? (
                      <>
                        <span>Rated</span>
                      </>
                    ) : (
                      <>
                        <label>Rate this item:</label>
                        <select
                          value={ratings[item.foodId] || "0"}
                          onChange={(e) =>
                            handleSelectChange(item.foodId, e.target.value)
                          }
                        >
                          <option value="0">Select rating</option>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() =>
                            handleRatingSubmit(
                              item.foodId,
                              ratings[item.foodId],
                              order.userId
                            )
                          }
                          disabled={!ratings[item.foodId] || ratings[item.foodId] === "0"}
                        >
                          Submit Rating
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Only show Reload Status if item has not been rated */}
            {!ratedItems[order.items[0].foodId] && (
              <button onClick={() => handleReloadStatus(order._id)}>Reload Status</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
