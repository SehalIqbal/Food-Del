import React, { useContext, useState } from 'react'
import './Cart.css'
import { StoreContext } from '../../Context/StoreContext'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Cart = () => {
  const { cartItems, food_list, addToCart, deleteFromCart, removeFromCart, getTotalCartAmount, url, currency, deliveryCharge } = useContext(StoreContext);
  const navigate = useNavigate();

  // State to store the entered promo code and the discount
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [limitMessages, setLimitMessages] = useState({}); // State for limit messages per item

  // Handle promo code input change
  const handlePromoCodeChange = (e) => {
    setPromoCode(e.target.value);
  };

  // Apply promo code by making an API call
  const applyPromoCode = async () => {
    try {
      const response = await axios.post('http://localhost:4000/api/promo/apply', { promoCode });

      if (response.data.success) {
        // Log the discount value from the backend response
        console.log('Backend Discount:', response.data.discount);

        // If the promo code is valid, apply the discount
        setDiscount(response.data.discount);
        setErrorMessage('');  // Clear any previous error messages
      } else {
        // Show error if promo code is invalid
        setDiscount(0);
        setErrorMessage(response.data.message || 'Invalid promo code.');
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      setErrorMessage('There was an error processing the promo code.');
    }
  };

  // Calculate the total price after applying the discount
  const totalPriceWithDiscount = () => {
    const subtotal = getTotalCartAmount();
    const discountAmount = discount > 0 ? subtotal * (discount / 100) : 0;

    return parseFloat((subtotal - discountAmount + deliveryCharge).toFixed(2));
  };

  // Check stock when adding to cart or removing from cart
  const handleAddToCart = (id) => {
    const currentCount = cartItems[id] || 0;
    const item = food_list.find(food => food._id === id);
    const stock = item?.stock || 0;  // Get the available stock

    if (currentCount >= stock) {
      setLimitMessages((prevMessages) => ({
        ...prevMessages,
        [id]: `Sorry, only ${stock} of this item can be ordered right now.`
      }));
      return;
    }

    setLimitMessages((prevMessages) => {
      const { [id]: _, ...rest } = prevMessages; // Remove the message for this item if the user adjusts the quantity
      return rest;
    });

    addToCart(id);
  };

  const handleRemoveFromCart = (id) => {
    removeFromCart(id);
    setLimitMessages((prevMessages) => {
      const { [id]: _, ...rest } = prevMessages; // Clear the limit message when the item is removed
      return rest;
    });
  };

  return (
    <div className='cart'>
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p> <p>Title</p> <p>Price</p> <p>Quantity</p> <p>Total</p> <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item, index) => {
          if (cartItems[item._id] > 0) {
            return (
              <div key={index}>
                <div className="cart-items-title cart-items-item">
                  <img src={url + "/images/" + item.image} alt="" />
                  <p>{item.name}</p>
                  <p>{currency}{item.price}</p>
                  <div className="cart-quantity-control">
                    <button onClick={() => handleRemoveFromCart(item._id)}>-</button>
                    <div>{cartItems[item._id]}</div>
                    <button onClick={() => handleAddToCart(item._id)}>+</button>
                  </div>

                  <p>{currency}{item.price * cartItems[item._id]}</p>
                  <p className='cart-items-remove-icon' onClick={() => deleteFromCart(item._id)}>x</p>
                </div>

                {/* Display the limit message for the specific item if it exists */}
                {limitMessages[item._id] && <div className="limit-message">{limitMessages[item._id]}</div>}
                <hr />
              </div>
            )
          }
        })}
      </div>
      
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details"><p>Subtotal</p><p>{currency}{getTotalCartAmount()}</p></div>
            <hr />
            <div className="cart-total-details"><p>Delivery Fee</p><p>{currency}{getTotalCartAmount() === 0 ? 0 : deliveryCharge}</p></div>
            <hr />
            {/* Add Discount line */}
            {discount > 0 && (
              <div className="cart-total-details"><p>Discount</p><p>{discount}%</p></div>
            )}
            <hr />
            <div className="cart-total-details"><b>Total</b><b>{currency}{totalPriceWithDiscount()}</b></div>
          </div>
          <button onClick={() => navigate('/order', { state: { total: totalPriceWithDiscount(), discount: discount || 0 } })}>
            PROCEED TO CHECKOUT
          </button>
        </div>

        {/* Promo code input */}
        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, Enter it here</p>
            <div className='cart-promocode-input'>
              <input
                type="text"
                placeholder='Promo Code'
                value={promoCode}
                onChange={handlePromoCodeChange}
              />
              <button onClick={applyPromoCode}>Submit</button>
            </div>
            <small style={{ fontSize: '12px', color: '#555' }}>
              * Discount applies to items only. Delivery fees are excluded.
            </small>

            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
