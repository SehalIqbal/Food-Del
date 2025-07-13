import React, { useContext, useState, useEffect } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';

const FoodItem = ({ image, name, price, desc, id, stock }) => {
  const [itemCount, setItemCount] = useState(0);
  const { cartItems, addToCart, removeFromCart, url, currency } = useContext(StoreContext);
  const [averageRating, setAverageRating] = useState(0); // State for storing average rating
  const [ratingCount, setRatingCount] = useState(0); // Add this line to declare ratingCount state
  const [limitMessage, setLimitMessage] = useState('');


  // Fetch average rating from the backend
  const fetchAverageRating = async (foodId) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/reviews/average/${foodId}`);
      const rating = Number(response.data.averageRating);
      setAverageRating(isNaN(rating) ? 0 : rating); // Fallback to 0 if not a valid number
      setRatingCount(response.data.ratingCount || 0); // <-- set count
    } catch (error) {
      console.error('Error fetching average rating:', error);
    }
  };

  const handleAddToCart = () => {
    const currentCount = cartItems[id] || 0;
    if (stock === 0) {
      setLimitMessage("This item is currently not available.");
      return;
    }
  
    if (currentCount >= stock) {
      setLimitMessage(`Sorry, only ${stock} of this item can be ordered right now.`);
      return;
    }
  
    setLimitMessage(""); // Clear message if adding to cart is successful
    addToCart(id);
  };
  
  

  useEffect(() => {
    if (id) {
      fetchAverageRating(id);
    }
  }, [id]);

  // Safely format average rating
  const formattedRating = typeof averageRating === 'number' ? averageRating.toFixed(1) : 'N/A';
  if (stock === 0) {
    return (
      <div className='food-item not-available'>
        <div className='food-item-img-container'>
          <img className='food-item-image' src={url + "/images/" + image} alt={name} />
          <div className="not-available-overlay">Not Available</div>
        </div>
        <div className="food-item-info">
          <div className="food-item-name-rating">
            <p>{name}</p>
            <div className="rating">
              <span>{formattedRating} / 5</span>
              <span> &nbsp; ({ratingCount} review{ratingCount !== 1 ? 's' : ''})</span>
            </div>
          </div>
          <p className="food-item-desc">{desc}</p>
          <p className="food-item-price">{currency}{price}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className='food-item'>
      <div className='food-item-img-container'>
        <img className='food-item-image' src={url + "/images/" + image} alt={name} />
        {!cartItems[id] ? (
         <img className='add' onClick={handleAddToCart} src={assets.add_icon_white} alt="Add to cart" />
        ) : (
          <div className="food-item-counter">
            <img src={assets.remove_icon_red} onClick={() => removeFromCart(id)} alt="Remove from cart" />
            <p>{cartItems[id]}</p>
            <img src={assets.add_icon_green} onClick={handleAddToCart} alt="Add more" />
            {limitMessage && <p className="limit-warning">{limitMessage}</p>}

          </div>
          
        )}
      </div>

      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <div className="rating">
            <span>{formattedRating} / 5</span>
            <span> &nbsp; ({ratingCount} review{ratingCount !== 1 ? 's' : ''})</span>
          </div>
        </div>
        <p className="food-item-desc">{desc}</p>
        <p className="food-item-price">{currency}{price}</p>
      </div>
    </div>
  );
};

export default FoodItem;
