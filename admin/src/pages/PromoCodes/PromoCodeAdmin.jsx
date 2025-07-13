import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PromoCodeAdmin.css';

const PromoCodeAdmin = () => {
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [promoCodes, setPromoCodes] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/promo');
      console.log('Response from backend:', response.data); // 🔍 Log the response
  
      if (response.data.success && response.data.promoCodes) {
        setPromoCodes(response.data.promoCodes);
      } else {
        console.error('Unexpected response format:', response.data);
      }
    } catch (err) {
      console.error('Error fetching promo codes:', err);
    }
  };
  

  const handleAddPromoCode = async (e) => {
    e.preventDefault();

    if (!promoCode || !discount) {
      setError("Promo Code and Discount are required.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/api/promo', {
        code: promoCode,
        discount,
      });

      if (response.data.success) {
        setSuccessMessage("Promo Code added successfully!");
        setPromoCode('');
        setDiscount('');
        fetchPromoCodes(); // Refresh the list
      } else {
        setError(response.data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`http://localhost:4000/api/promo/${id}`);
      console.log("Promo code deleted successfully.");
  
      // 💡 Remove the deleted promo from state
      setPromoCodes((prev) => prev.filter((promo) => promo._id !== id));
    } catch (err) {
      console.error("Error deleting promo code:", err);
    }
  };
  

  return (
    <div className="promo-code-admin">
      <h2>Manage Promo Codes</h2>
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <form onSubmit={handleAddPromoCode} className="promo-form">
        <div className="form-group">
          <label htmlFor="promoCode">Promo Code</label>
          <input
            type="text"
            id="promoCode"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="discount">Discount (%)</label>
          <input
            type="number"
            id="discount"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Promo Code</button>
      </form>

      <div className="promo-list">
  <h3>Existing Promo Codes</h3>
  <ul>
  {promoCodes.map((promo) => (
    <li key={promo._id}>
        <strong>{promo.code}</strong> - {promo.discount}%
        <button onClick={() => handleDelete(promo._id)}>Delete</button>
    </li>
    ))}

  </ul>
</div>


    </div>
  );
};

export default PromoCodeAdmin;
