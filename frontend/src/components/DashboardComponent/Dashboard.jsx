import React, { useState ,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import './Dashboard.css';
import test from '../../assets/bbcone.png';
import { NavLink } from 'react-router-dom';

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

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setUserData(data));
  }, []);

  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [audio, setAudio] = useState(null);
  const handlePlayPreview = () => {
    if (!userData?.playingNow?.preview_url) return;
    if (audio) {
      audio.pause();
      setAudio(null);
      setIsPreviewPlaying(false);
    } else {
      const newAudio = new Audio(userData.playingNow.preview_url);
      newAudio.play();
      setAudio(newAudio);
      setIsPreviewPlaying(true);
      newAudio.onended = () => {
        setIsPreviewPlaying(false);
        setAudio(null);
      };
    }
  };

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [audio]);
  return (
    <div className='container-dash'>
      <div className='header-dash'>
        <div className='nav-bar-dash'>
          <div className='logo-name-dash'>
            <img src={logo} alt='Lunafy logo' />
            <span className='name-dash'>Lunafy</span>
          </div>
          <div className='burger-menu'>
            <div className='burger' onClick={() => setMenuOpen(!menuOpen)}>
              <div className='bar'></div>
              <div className='bar'></div>
              <div className='bar'></div>
            </div>
            {menuOpen && (
              <div className='menu'>
                <a href='/dashboard'>Profile</a>
                <a href='/profile'>Settings</a>
                <a href='/logout'>Logout</a>
              </div>
            )}
          </div>
        </div>
        <div className='info-display'>
          <div className='info-dash'>
            <div className='photo-name'>
              <div className='all-info'>
                <img src={userData?.profileImage || test} alt='user-pic' />
                <span className='user-name'>{userData?.display_name || userData?.name || "User"}</span>
              </div>
            </div>
            <div className='playing-now'>
              {userData?.playingNow ? (
                <div className='content-all' style={{ cursor: userData?.playingNow?.preview_url ? 'pointer' : 'default' }} onClick={handlePlayPreview}>
                  <img className='test'
                    src={userData.playingNow.albumImage || test}
                    alt="Song Cover"
                  />
                  <div>
                    <div className='song-name'>
                      {userData.playingNow.name}
                    </div>
                    <div className='artist-name'>
                      {userData.playingNow.artists}
                    </div>
                    {userData.playingNow.preview_url && (
      <div style={{ fontSize: '0.8em', color: '#1db954' }}>
        {isPreviewPlaying ? 'Playing preview...' : 'Click to play 30s preview'}
      </div>
    )}h
                  </div>
                </div>
              ) : (
                <div className='content-all'>
                  <span>No song playing</span>
                </div>
              )}
            </div>
          </div>
          <div className='nav-dash'>
            <NavLink to="/dashboard"  className="dashboard-link">Overview</NavLink>
            <NavLink to="/artists" className="dashboard-link">Artists</NavLink>
            <NavLink to="/songs" className="dashboard-link">Songs</NavLink>
            <NavLink to="/albums" className="dashboard-link">Albums</NavLink>
            <NavLink to="/genres" className="dashboard-link">Genres</NavLink>
            <NavLink to="/playlists" className="dashboard-link">Playlists</NavLink>
            <NavLink to="/taste" className="dashboard-link">Dicover your taste</NavLink>
            <NavLink to="/roast" className="dashboard-link">roast</NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;