import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Lunafy</h4>
          <p>Your personal Spotify analytics platform</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/dashboard">Overview</a></li>
            <li><a href="/Artists">Top Artists</a></li>
            <li><a href="/songs">Top Songs</a></li>
            <li><a href="/taste">Discover your taste</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Connect</h4>
          <ul>
            <li><a href="https://github.com/zaid03" target="_blank" rel='noreferrer'>GitHub</a></li>
            <li><a href="https://www.linkedin.com/in/zaid-terguy/" target="_blank" rel='noreferrer'>LinkedIn</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Legal</h4>
          <ul>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2025 Lunafy. All rights reserved.</p>
        <p>Powered by Spotify Web API</p>
        
      </div>
      <p className='special'>Made with ❤️ in Morocco</p>
    </footer>
  );
}

export default Footer;