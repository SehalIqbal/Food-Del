import React, { useEffect, useState } from 'react'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'
import { useLocation } from 'react-router-dom'

const Home = () => {
  const [category, setCategory] = useState("All");
  const location = useLocation();

  useEffect(() => {
    if (location.state?.searchQuery) {
      const query = location.state.searchQuery.toLowerCase().replace(/\s+/g, "-");
      const element = document.getElementById(query);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setCategory(location.state.searchQuery); // Set the category based on the search
      }
    }
  }, [location.state]);

  return (
    <>
      <Header />
      <ExploreMenu setCategory={setCategory} category={category} />
      <FoodDisplay category={category} /> {/* Passing the category to FoodDisplay */}
      <AppDownload />
    </>
  )
}

export default Home;
