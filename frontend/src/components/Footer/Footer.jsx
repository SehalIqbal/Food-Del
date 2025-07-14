import React from 'react';
import './Footer.css';
import { assets } from '../../assets/assets';

const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        <div className="footer-content-left">
         <h1>BhukkadBay</h1>
          <p>Craving something delicious? BhukkadBay delivers your favorite meals hot and fresh, right to your door. Discover the flavors you love.</p>
          <div className="footer-social-icons">
            <img src={assets.facebook_icon} alt="Facebook" />
            <img src={assets.twitter_icon} alt="Twitter" />
            <img src={assets.linkedin_icon} alt="LinkedIn" />
          </div>
        </div>
        <div className="footer-content-center">
          <h2>Explore</h2>
          <ul>
            <li>Home</li>
            <li>About</li>
            <li>Menu</li>
            <li>Terms & Conditions</li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>Contact Us</h2>
          <ul>
            <li>0339-2273743</li>
            <li>sehaliqbal27@gmail.com</li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">
        © 2024 BhukkadBay - All Rights Reserved.
      </p>
    </div>
  );
};

export default Footer;
