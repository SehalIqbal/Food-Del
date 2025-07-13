import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { url } from '../../assets/assets';
import './StockManagement.css';

const StockManagement = () => {
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFoodItems = async () => {
            try {
                const response = await axios.get(`${url}/api/food/list`);
                if (response.data.success) {
                    setFoodItems(response.data.data);
                } else {
                    toast.error('Failed to fetch food items');
                }
            } catch (error) {
                console.error('Error fetching food items:', error);
                toast.error('Error fetching food items');
            } finally {
                setLoading(false);
            }
        };

        fetchFoodItems();
    }, []);

    const handleSave = async (id, stock, price) => {
        try {
            const response = await axios.post(`${url}/api/food/updateStock`, {
                id,
                stock,
                price
            });

            if (response.data.success) {
                toast.success(response.data.message);
                setFoodItems(foodItems.map(item =>
                    item._id === id ? { ...item, stock, price } : item
                ));
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error saving changes:', error);
            toast.error('Error saving changes');
        }
    };

    const handleInputChange = (id, type, value) => {
        setFoodItems(foodItems.map(item =>
            item._id === id ? { ...item, [type]: value } : item
        ));
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="stock-management">
            <h1>Stock Management</h1>

            <div className="stock-list">
                {foodItems.map((item) => {
                    const status =
                        item.stock === 0
                            ? "Out of Stock"
                            : item.stock < 5
                            ? "Low Stock"
                            : "In Stock";

                    const statusClass =
                        item.stock === 0
                            ? "status-red"
                            : item.stock < 5
                            ? "status-orange"
                            : "status-green";

                    return (
                        <div key={item._id} className="stock-item-wrapper">
                            <div className="stock-left">
                                <div className="title">{item.name}</div>
                                <div className="stock-category">Category: {item.category}</div>
                                <div className="stock-price">Price: ${item.price}</div>
                            </div>

                            <div className="stock-right">
                                <div className="input-group">
                                    <input
                                        type="number"
                                        value={item.price}
                                        onChange={(e) => handleInputChange(item._id, 'price', Number(e.target.value))}
                                        min="0"
                                    />
                                    <input
                                        type="number"
                                        value={item.stock}
                                        onChange={(e) => handleInputChange(item._id, 'stock', Number(e.target.value))}
                                        min="0"
                                    />
                                </div>

                                <div className={`status-badge ${statusClass}`}>{status}</div>

                                <div className="actions">
                                    <button
                                        className="save-btn"
                                        onClick={() => handleSave(item._id, item.stock, item.price)}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StockManagement;
