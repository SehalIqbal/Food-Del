import React, { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../Context/StoreContext'
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useLocation } from 'react-router-dom';


const PlaceOrder = () => {
    const location = useLocation();
    const total = parseFloat(location.state?.total?.toFixed(2)) || 0;
    const discount = location.state?.discount || 0;


    const [payment, setPayment] = useState("cod")
    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        street: "",
        city: "",
        state: "",
        zipcode: "",
        country: "",
        phone: ""
    })

    const { getTotalCartAmount, token, food_list, cartItems, url, setCartItems,currency,deliveryCharge } = useContext(StoreContext);

    const navigate = useNavigate();

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setData(data => ({ ...data, [name]: value }))
    }

    const placeOrder = async (e) => {
        e.preventDefault();
    
        let orderItems = food_list
        .filter(item => cartItems[item._id] && cartItems[item._id] > 0)
        .map(item => ({
            foodId: item._id,
            name: item.name,
            quantity: cartItems[item._id],
            price: item.price
        }));

    
        let orderData = {
            address: data,
            items: orderItems,
            amount: total,
            discount: location.state?.discount || 0
        };

         console.log("Sending COD Order:", orderData); // ADD THIS

    
        if (payment === "stripe") {
            try {
                let response = await axios.post("http://localhost:4000/api/order/place", orderData, {
                    headers: { token }
                });
    
                if (response.data.success) {
                    const { session_url } = response.data;
                    console.log('Stripe session URL:', session_url);
                    if (session_url) {
                        window.location.replace(session_url);
                    } else {
                        toast.error("Session URL is missing");
                    }
                } else {
                    toast.error("Something went wrong");
                }
            } catch (err) {
                console.error("Stripe checkout error:", err.response?.data || err.message);
                toast.error("Error processing payment.");
            }
        } else if (payment === "cod") {
            try {
                let response = await axios.post("http://localhost:4000/api/order/placecod", orderData, {
                    headers: { token }
                });
    
                if (response.data.success) {
                    toast.success("Order placed successfully with COD!");
                    setCartItems({}); // clear cart
                    navigate("/myorders");
                } else {
                    toast.error("Failed to place order.");
                }
            } catch (err) {
                console.error("COD order error:", err.response?.data || err.message);
                toast.error("Error placing COD order.");
            }
        }
    };
    

    useEffect(() => {
        if (!token) {
            toast.error("to place an order sign in first")
            navigate('/cart')
        }
        else if (getTotalCartAmount() === 0) {
            navigate('/cart')
        }
    }, [token])

    return (
        <form onSubmit={placeOrder} className='place-order'>
            <div className="place-order-left">
                <p className='title'>Delivery Information</p>
                <div className="multi-field">
                    <input type="text" name='firstName' onChange={onChangeHandler} value={data.firstName} placeholder='First name' required />
                    <input type="text" name='lastName' onChange={onChangeHandler} value={data.lastName} placeholder='Last name' required />
                </div>
                <input type="email" name='email' onChange={onChangeHandler} value={data.email} placeholder='Email address' required />
                <input type="text" name='street' onChange={onChangeHandler} value={data.street} placeholder='Street' required />
                <div className="multi-field">
                    <input type="text" name='city' onChange={onChangeHandler} value={data.city} placeholder='City' required />
                    <input type="text" name='state' onChange={onChangeHandler} value={data.state} placeholder='State' required />
                </div>
                <div className="multi-field">
                    <input type="text" name='zipcode' onChange={onChangeHandler} value={data.zipcode} placeholder='Zip code' required />
                    <input type="text" name='country' onChange={onChangeHandler} value={data.country} placeholder='Country' required />
                </div>
                <input type="text" name='phone' onChange={onChangeHandler} value={data.phone} placeholder='Phone' required />
            </div>
            <div className="place-order-right">
                <div className="cart-total">
                    <h2>Cart Totals</h2>
                    <div>
                        <div className="cart-total-details">
                            <b>Total Amount</b>
                            <b>{currency}{total}</b>
                        </div>
                    </div>
                </div>
                <div className="payment">
                    <h2>Payment Method</h2>
                    <div onClick={() => setPayment("cod")} className="payment-option">
                        <img src={payment === "cod" ? assets.checked : assets.un_checked} alt="" />
                        <p>COD ( Cash on delivery )</p>
                    </div>
                    <div onClick={() => setPayment("stripe")} className="payment-option">
                        <img src={payment === "stripe" ? assets.checked : assets.un_checked} alt="" />
                        <p>Stripe ( Credit / Debit )</p>
                    </div>
                </div>
                <button className='place-order-submit' type='submit'>{payment==="cod"?"Place Order":"Proceed To Payment"}</button>
            </div>
        </form>
    )
}

export default PlaceOrder
