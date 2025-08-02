import React, { useState ,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/test-session', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (!data.userId) {
          navigate('/');
        }
      })
      .catch(() => {
        navigate('/');
      });
  }, [navigate]);

  useEffect(() => {
    if(!menuOpen) return;
    function handleClickOutside(event) {
    const menu = document.querySelector('.menu');
    const burger = document.querySelector('.burger');
    if (
      menu &&
      !menu.contains(event.target) &&
      burger &&
      !burger.contains(event.target)
    ) {
      setMenuOpen(false);
    }
  }
  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };

  }, [menuOpen]);
  return (

    <div className='container'>
      <div className='header' style={{height: '300px'}}>
        <div className='nav-bar'>
          <div className='logo-name'>
            <img src={logo} alt='Lunafy logo' />
            <span className='name'  >Lunafy</span>
          </div>
          <div className='burger' onClick={() => setMenuOpen(!menuOpen)}>
            <div className='bar'></div>
            <div className='bar'></div>
            <div className='bar'></div>
          </div>
          {menuOpen && (
            <div className='menu'>
              <a href='/dashboard'>Dashboard</a>
              <a href='/profile'>Profile</a>
              <a href='/logout'>Logout</a>
            </div>
          )}
        </div>
        <div className="dashboard-nav-static">
          <a href="#" className="dashboard-link">Overview</a>
          <a href="#" className="dashboard-link">Artists</a>
          <a href="#" className="dashboard-link">Songs</a>
          <a href="#" className="dashboard-link">Albums</a>
          <a href="#" className="dashboard-link">Genres</a>
          <a href="#" className="dashboard-link">Playlists</a>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;