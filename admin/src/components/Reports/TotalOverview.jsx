import React, { useEffect, useState } from 'react';
import './TotalOverview.css';

const TotalOverview = ({ currency }) => {
  const [totalData, setTotalData] = useState({
    totalOrders: 0,
    totalSales: 0,
    totalItemsSold: 0,
    totalRefunds: 0,
    averageOrderValue: 0,
    totalDiscountRevenue: 0,
    salesByPaymentMethod: { cod: 0, stripe: 0 },
    deliveryChargesCollected: 0,
  });

  useEffect(() => {
    const fetchTotalOverviewData = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/reports/total-overview');
        const data = await response.json();
        setTotalData(data);
      } catch (error) {
        console.error('Error fetching total overview data:', error);
      }
    };

    fetchTotalOverviewData();
  }, []);

  const calculateAverageOrderValue = () => {
    return totalData.totalOrders === 0
      ? 0
      : totalData.totalSales / totalData.totalOrders;
  };

  return (
    <div className="total-overview">
      <h2>Total Sales Overview</h2>
      <div className="overview-item">
        <p>Total Orders: <span>{totalData.totalOrders}</span></p>
      </div>
      <div className="overview-item">
        <p>Total Sales: <span>{currency} {totalData.totalSales}</span> (Delivered items only)</p>
      </div>
      <div className="overview-item">
        <p>Total Items Sold: <span>{totalData.totalItemsSold}</span> (Delivered items only)</p>
      </div>
      <div className="overview-item">
        <p>Average Order Value (AOV): <span>{currency} {calculateAverageOrderValue().toFixed(2)}</span></p>
      </div>
      <div className="overview-item">
        <p>Total Revenue lost from Discounts: <span>{currency} {totalData.totalDiscountRevenue}</span></p>
      </div>
      <div className="overview-item">
        <p>Sales by COD: <span>{currency} {totalData.salesByPaymentMethod.cod}</span></p>
      </div>
      <div className="overview-item">
        <p>Sales by Strdipe: <span>{currency} {totalData.salesByPaymentMethod.stripe}</span></p>
      </div>
      <div className="overview-item">
        <p>Delivery Charges Collected: <span>{currency} {totalData.deliveryChargesCollected}</span></p>
      </div>
    </div>
  );
};

export default TotalOverview;
