import React from 'react';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import { Route, Routes } from 'react-router-dom';
import Add from './pages/Add/Add';
import Stock from './pages/StockManagement/StockManagement';
import List from './pages/List/List';
import Orders from './pages/Orders/Orders';
import PromoCodeAdmin from './pages/PromoCodes/PromoCodeAdmin';  // Updated path
import AdminReport from './pages/AdminReport/AdminReport'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <div className='app'>
      <ToastContainer />
      <Navbar />
      <hr />
      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path="/add" element={<Add />}          />
          <Route path="/stock-management" element={<Stock />}      />
          <Route path="/list" element={<List />}        />
          <Route path="/orders" element={<Orders />}    />
          <Route path="/promo" element={<PromoCodeAdmin />} />
          <Route path="/admin-report" element={<AdminReport />} /> 
        </Routes>
      </div>
    </div>
  );
}

export default App;
