import React from 'react';
import './ItemWiseSales.css';

const ItemWiseSales = ({ currency = '$', data = [] }) => {
  if (!data.length) {
    return <p>Loading...</p>;
  }

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Top-Selling Items</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-gray-600 border-b">
              <th className="px-4 py-2">Rank</th>
              <th className="px-4 py-2">Item</th>
              <th className="px-4 py-2">Quantity Sold</th>
              <th className="px-4 py-2">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 font-semibold text-indigo-600">{idx + 1}</td>
                <td className="px-4 py-2">{item._id}</td>
                <td className="px-4 py-2">{item.quantitySold}</td>
                <td className="px-4 py-2">{currency}{item.totalRevenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ItemWiseSales;
