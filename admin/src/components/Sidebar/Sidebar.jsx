import React from 'react';
import './Sidebar.css';
import { assets } from '../../assets/assets';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        <NavLink to='/add' className="sidebar-option">
            <img src={assets.add_icon} alt="" />
            <p>Add Items</p>
        </NavLink>
        <NavLink to='/list' className="sidebar-option">
            <img src={assets.order_icon} alt="" />
            <p>List Items</p>
        </NavLink>
        <NavLink to='/orders' className="sidebar-option">
            <img src={assets.order_icon} alt="" />
            <p>Orders</p>
        </NavLink>
        <NavLink to='/promo' className="sidebar-option">
            <img src={assets.promo_icon} alt="" />
            <p>Promo Codes</p>
        </NavLink>
        <NavLink to='/stock-management' className="sidebar-option">
            <img src={assets.stock_icon} alt="" />
            <p>Stock Management</p>
        </NavLink>
        {/* Add Admin Report Link */}
        <NavLink to='/admin-report' className="sidebar-option">
            <img src={assets.report_icon} alt="" /> {/* Add an appropriate report icon */}
            <p>Admin Reports</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
