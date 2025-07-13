import React, { useState, useEffect } from 'react';
import TotalOverview from '../../components/Reports/TotalOverview';
import ItemWiseSales from '../../components/Reports/ItemWiseSales';
import axios from 'axios';

import './AdminReport.css';

const AdminReport = () => {
  const [activeTab, setActiveTab] = useState('totalOverview'); // Default active tab
  const [totalData, setTotalData] = useState(null); // State to store fetched total overview data
  const [itemWiseData, setItemWiseData] = useState([]); // State to store fetched item-wise sales data
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Total Overview Data
        const totalOverviewResponse = await axios.get('http://localhost:4000/api/reports/total-overview');
        setTotalData(totalOverviewResponse.data);

        // Fetch Item-wise Sales Data (example, adjust according to your API)
        const itemWiseResponse = await axios.get('http://localhost:4000/api/reports/item-wise-sales');
        setItemWiseData(itemWiseResponse.data);

        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error('Error fetching report data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array to run only once when component mounts

  if (loading) {
    return <div>Loading...</div>; // Show loading message while data is being fetched
  }

  const handleGenerateReport = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/reports/generate-pdf');
      const blob = await response.blob();
  
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sales-report.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report.');
    }
  };
  
  return (
    <div className="admin-report">
      <h1 className="text-3xl font-bold mb-6">Admin Reports</h1>

      {/* Navigation between report sections */}
      <div className="tabs mb-6">
  <button
    onClick={() => setActiveTab('totalOverview')}
    className={`tab ${activeTab === 'totalOverview' ? 'active' : ''}`}
  >
    Total Sales Overview
  </button>
  <button
    onClick={() => setActiveTab('itemWiseSales')}
    className={`tab ${activeTab === 'itemWiseSales' ? 'active' : ''}`}
  >
    Item-wise Sales
  </button>
  <button
    onClick={handleGenerateReport}
    className="tab generate-report-btn"
  >
    Generate Report
  </button>
</div>


      {/* Render active tab content */}
      {activeTab === 'totalOverview' && (
        <TotalOverview data={totalData} currency="$" />
      )}
      {activeTab === 'itemWiseSales' && (
        <ItemWiseSales data={itemWiseData} currency="$" />
      )}
    </div>
    
  );
};

export default AdminReport;

