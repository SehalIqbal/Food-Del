import React, { useContext } from 'react'
import './ExploreMenu.css'
import { StoreContext } from '../../Context/StoreContext'

const ExploreMenu = ({ category, setCategory }) => {
  const { menu_list } = useContext(StoreContext);

  const normalizeCategoryName = (name) => {
    return name.toLowerCase().replace(/\s+/g, "-");
  }

  return (
    <div className='explore-menu' id='explore-menu'>
      <h1>Explore our menu</h1>
      <p className='explore-menu-text'>Choose from a diverse menu featuring a delectable array of dishes. Our mission is to satisfy your cravings and elevate your dining experience, one delicious meal at a time.</p>
      <div className="explore-menu-list">
        {menu_list.map((item, index) => {
          const normalizedItemCategory = normalizeCategoryName(item.menu_name);
          return (
            <div 
              onClick={() => setCategory(prev => prev === item.menu_name ? "All" : item.menu_name)} 
              key={index} 
              className='explore-menu-list-item'
              id={normalizedItemCategory}
            >
              <img src={item.menu_image} className={category === item.menu_name ? "active" : ""} alt="" />
              <p>{item.menu_name}</p>
            </div>
          )
        })}
      </div>
      <hr />
    </div>
  );
};


export default ExploreMenu;
