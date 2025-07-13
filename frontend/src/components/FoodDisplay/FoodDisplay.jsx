import React, { useContext } from 'react'
import './FoodDisplay.css'
import FoodItem from '../FoodItem/FoodItem'
import { StoreContext } from '../../Context/StoreContext'

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext);

  const normalizeCategoryName = (name) => {
    return name.toLowerCase().replace(/\s+/g, "-");
  }

  // Normalize the category name to match the food item category
  const normalizedCategory = normalizeCategoryName(category);

  const filteredFoodItems = food_list.filter(item => 
    normalizedCategory === "all" || normalizedCategory === normalizeCategoryName(item.category)
  );

  return (
    <div className='food-display' id='food-display'>
      <h2>Menu</h2>

      {/* Display a message if no dishes match the selected category */}
      {filteredFoodItems.length === 0 && (
        <p>No dishes found for this category</p>
      )}

      <div className='food-display-list'>
        {/* Render food items */}
        {filteredFoodItems.map((item) => {
          return <FoodItem key={item._id} image={item.image} name={item.name} desc={item.description} price={item.price} id={item._id}  stock={item.stock} />
        })}
      </div>
    </div>
  );
}

export default FoodDisplay;
