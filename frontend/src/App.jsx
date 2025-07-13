import React, { useState, useEffect } from 'react'; // 👈 ADD useEffect
import Home from './pages/Home/Home';
import Footer from './components/Footer/Footer';
import Navbar from './components/Navbar/Navbar';
import { Route, Routes } from 'react-router-dom';
import Cart from './pages/Cart/Cart';
import LoginPopup from './components/LoginPopup/LoginPopup';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import MyOrders from './pages/MyOrders/MyOrders';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Verify from './pages/Verify/Verify';

// 👇 ADD these 2 lines for the chatbot
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

const App = () => {
  const [showLogin, setShowLogin] = useState(false);

// In App.jsx

useEffect(() => {
  createChat({
    webhookUrl: 'https://sehal31.app.n8n.cloud/webhook/6f3f168b-c586-4d00-a69b-5ee28a804e46/chat',
    mode: 'window',
    initialMessages: [
      '👋 Hi! How can I assist you with FoodDel today?',
      'You can ask about orders, foods, promos, or anything else!',
    ],
  });

  setTimeout(() => {
    // n8n creates a container with the ID 'n8n-chat'
    const chatWrapper = document.getElementById('n8n-chat');
    if (!chatWrapper) return;

    let isDragging = false;
    let offset = { x: 0, y: 0 };

    const startDrag = (e) => {
      // Prevent dragging when interacting with input fields or buttons inside the chat window
      const isInteractiveElement = e.target.closest('button, input, a, textarea');
      const isHeader = e.target.closest('.chat-header');
      const isToggleButton = e.target.closest('.chat-toggle-button');

      if (isInteractiveElement && !isHeader && !isToggleButton) {
          return;
      }

      isDragging = true;
      offset = {
        x: e.clientX - chatWrapper.getBoundingClientRect().left,
        y: e.clientY - chatWrapper.getBoundingClientRect().top,
      };
      chatWrapper.style.cursor = 'grabbing';
    };

    const drag = (e) => {
      if (!isDragging) return;
      e.preventDefault(); // Prevent text selection while dragging

      chatWrapper.style.left = `${e.clientX - offset.x}px`;
      chatWrapper.style.top = `${e.clientY - offset.y}px`;
      chatWrapper.style.right = 'auto';
      chatWrapper.style.bottom = 'auto';
    };

    const stopDrag = () => {
      isDragging = false;
      chatWrapper.style.cursor = 'grab';
    };

    chatWrapper.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);

    // Cleanup function to remove event listeners
    return () => {
        chatWrapper.removeEventListener('mousedown', startDrag);
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
    };

  }, 1000); // Wait for n8n to render the chat
}, []);

  return (
    <>
      <ToastContainer />
    
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}
      <div className='app'>
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/order' element={<PlaceOrder />} />
          <Route path='/myorders' element={<MyOrders />} />
          <Route path='/verify' element={<Verify />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
};

export default App;
