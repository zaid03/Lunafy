import React, { useState ,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import './Dashboard.css';
import test from '../../assets/bbcone.png';
import { NavLink } from 'react-router-dom';
import Footer from '../FooterComponent';

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

  // const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [audio, setAudio] = useState(null);
  const handlePlayPreview = () => {
    if (!userData?.playingNow?.preview_url) return;
    if (audio) {
      audio.pause();
      setAudio(null);
      // setIsPreviewPlaying(false);
    } else {
      const newAudio = new Audio(userData.playingNow.preview_url);
      newAudio.play();
      setAudio(newAudio);
      // setIsPreviewPlaying(true);
      newAudio.onended = () => {
        // setIsPreviewPlaying(false);
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
                    {/* {userData.playingNow.preview_url && (
                  <div style={{ fontSize: '0.8em', color: '#1db954' }}>
                    {isPreviewPlaying ? 'Playing preview...' : 'Click to play 30s preview'}
                  </div>
                )} */}
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

      <div className='stats-content'>
        <div className='time-periode'>
          <select id="period">
            <option value="volvo">4 Weeks</option>
            <option value="saab">6 Months</option>
            <option value="opel">1 Year</option>
          </select>
        </div>

        <div className='top-cards'>
          <div className='top-artists'>
            <div className='button-songs'>
              <h3>Top Artists</h3>
              <div className='more'>
                <button className='save'>Share</button>
              </div>
            </div>
            <div className='artists-list'>
              <div className='artist-item'>
                <span className='artist-rank'>1</span>
                <img src={test} alt='Artist' className='artist-pfp' />
                <span className='artist-name'>Taylor Swift</span>
              </div>
              <div className='artist-item'>
                <span className='artist-rank'>2</span>
                <img src={test} alt='Artist' className='artist-pfp' />
                <span className='artist-name'>Drake</span>
              </div>
              <div className='artist-item'>
                <span className='artist-rank'>3</span>
                <img src={test} alt='Artist' className='artist-pfp' />
                <span className='artist-name'>Bad Bunny</span>
              </div>
              <div className='artist-item'>
                <span className='artist-rank'>4</span>
                <img src={test} alt='Artist' className='artist-pfp' />
                <span className='artist-name'>The Weeknd</span>
              </div>
              <div className='artist-item'>
                <span className='artist-rank'>5</span>
                <img src={test} alt='Artist' className='artist-pfp' />
                <span className='artist-name'>Ariana Grande</span>
              </div>
              <div className='artist-item'>
                <span className='artist-rank'>6</span>
                <img src={test} alt='Artist' className='artist-pfp' />
                <span className='artist-name'>Ed Sheeran</span>
              </div>
              <div className='artist-item'>
                <span className='artist-rank'>7</span>
                <img src={test} alt='Artist' className='artist-pfp' />
                <span className='artist-name'>Billie Eilish</span>
              </div>
              <div className='artist-item'>
                <span className='artist-rank'>8</span>
                <img src={test} alt='Artist' className='artist-pfp' />
                <span className='artist-name'>Post Malone</span>
              </div>
              <div className='artist-item'>
                <span className='artist-rank'>9</span>
                <img src={test} alt='Artist' className='artist-pfp' />
                <span className='artist-name'>Dua Lipa</span>
              </div>
              <div className='artist-item'>
                <span className='artist-rank'>10</span>
                <img src={test} alt='Artist' className='artist-pfp' />
                <span className='artist-name'>Justin Bieber</span>
              </div>

              <div className='see-more'>
                <button className='more-content'>See more</button>
              </div>
            </div>
          </div>

          <div className='top-songs'>
            <div className='button-songs'>
              <h3>Top Songs</h3>
              <div className='more'>
                <button className='save'>Save as Playlist</button>
                <button className='save'>Share</button>
              </div>
            </div>
            <div className='songs-list'>
              <div className='song-item'>
                <span className='song-rank'>1</span>
                <img src={test} alt='Song Cover' className='song-cover' />
                <div className='song-info'>
                  <span className='song-title'>Anti-Hero</span>
                  <span className='song-artist'>Taylor Swift</span>
                </div>
              </div>
              <div className='song-item'>
                <span className='song-rank'>2</span>
                <img src={test} alt='Song Cover' className='song-cover' />
                <div className='song-info'>
                  <span className='song-title'>As It Was</span>
                  <span className='song-artist'>Harry Styles</span>
                </div>
              </div>
              <div className='song-item'>
                <span className='song-rank'>3</span>
                <img src={test} alt='Song Cover' className='song-cover' />
                <div className='song-info'>
                  <span className='song-title'>Un Verano Sin Ti</span>
                  <span className='song-artist'>Bad Bunny</span>
                </div>
              </div>
              <div className='song-item'>
                <span className='song-rank'>4</span>
                <img src={test} alt='Song Cover' className='song-cover' />
                <div className='song-info'>
                  <span className='song-title'>Blinding Lights</span>
                  <span className='song-artist'>The Weeknd</span>
                </div>
              </div>
              <div className='song-item'>
                <span className='song-rank'>5</span>
                <img src={test} alt='Song Cover' className='song-cover' />
                <div className='song-info'>
                  <span className='song-title'>Positions</span>
                  <span className='song-artist'>Ariana Grande</span>
                </div>
              </div>
              <div className='song-item'>
                <span className='song-rank'>6</span>
                <img src={test} alt='Song Cover' className='song-cover' />
                <div className='song-info'>
                  <span className='song-title'>Shape of You</span>
                  <span className='song-artist'>Ed Sheeran</span>
                </div>
              </div>
              <div className='song-item'>
                <span className='song-rank'>7</span>
                <img src={test} alt='Song Cover' className='song-cover' />
                <div className='song-info'>
                  <span className='song-title'>Bad Guy</span>
                  <span className='song-artist'>Billie Eilish</span>
                </div>
              </div>
              <div className='song-item'>
                <span className='song-rank'>8</span>
                <img src={test} alt='Song Cover' className='song-cover' />
                <div className='song-info'>
                  <span className='song-title'>Circles</span>
                  <span className='song-artist'>Post Malone</span>
                </div>
              </div>
              <div className='song-item'>
                <span className='song-rank'>9</span>
                <img src={test} alt='Song Cover' className='song-cover' />
                <div className='song-info'>
                  <span className='song-title'>Levitating</span>
                  <span className='song-artist'>Dua Lipa</span>
                </div>
              </div>
              <div className='song-item'>
                <span className='song-rank'>10</span>
                <img src={test} alt='Song Cover' className='song-cover' />
                <div className='song-info'>
                  <span className='song-title'>Sorry</span>
                  <span className='song-artist'>Justin Bieber</span>
                </div>
              </div>
              <div className='see-more'>
                <button className='more-content'>See more</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className='albums'>
          <div className='top-albums'>
            <div className='button-songs'>
              <h3 className='test2'>Top Albums</h3>
              <div className='more'>
                <button className='save'>Share</button>
              </div>
            </div>
            <div className='album-list'>
              <div className='album-item'>
                <span className='album-rank'>1</span>
                <img src={test} alt='Song Cover' className='album-cover' />
                <div className='album-info'>
                  <span className='album-title'>Anti-Hero</span>
                  <span className='album-artist'>Taylor Swift</span>
                </div>
              </div>
              <div className='album-item'>
                <span className='song-rank'>2</span>
                <img src={test} alt='Song Cover' className='album-cover' />
                <div className='album-info'>
                  <span className='album-title'>Anti-Hero</span>
                  <span className='album-artist'>Taylor Swift</span>
                </div>
              </div>
              <div className='album-item'>
                <span className='song-rank'>3</span>
                <img src={test} alt='Song Cover' className='album-cover' />
                <div className='album-info'>
                  <span className='album-title'>Anti-Hero</span>
                  <span className='album-artist'>Taylor Swift</span>
                </div>
              </div>
              <div className='album-item'>
                <span className='song-rank'>4</span>
                <img src={test} alt='Song Cover' className='album-cover' />
                <div className='album-info'>
                  <span className='album-title'>Anti-Hero</span>
                  <span className='album-artist'>Taylor Swift</span>
                </div>
              </div>
              <div className='album-item'>
                <span className='song-rank'>5</span>
                <img src={test} alt='Song Cover' className='album-cover' />
                <div className='album-info'>
                  <span className='album-title'>Anti-Hero</span>
                  <span className='album-artist'>Taylor Swift</span>
                </div>
              </div>
              <div className='album-item'>
                <span className='song-rank'>6</span>
                <img src={test} alt='Song Cover' className='album-cover' />
                <div className='album-info'>
                  <span className='album-title'>Anti-Hero</span>
                  <span className='album-artist'>Taylor Swift</span>
                </div>
              </div>
              <div className='album-item'>
                <span className='song-rank'>7</span>
                <img src={test} alt='Song Cover' className='album-cover' />
                <div className='album-info'>
                  <span className='album-title'>Anti-Hero</span>
                  <span className='album-artist'>Taylor Swift</span>
                </div>
              </div>
              <div className='album-item'>
                <span className='song-rank'>8</span>
                <img src={test} alt='Song Cover' className='album-cover' />
                <div className='album-info'>
                  <span className='album-title'>Anti-Hero</span>
                  <span className='album-artist'>Taylor Swift</span>
                </div>
              </div>
              <div className='album-item'>
                <span className='song-rank'>9</span>
                <img src={test} alt='Song Cover' className='album-cover' />
                <div className='album-info'>
                  <span className='album-title'>Anti-Hero</span>
                  <span className='album-artist'>Taylor Swift</span>
                </div>
              </div>
              <div className='album-item'>
                <span className='song-rank'>10</span>
                <img src={test} alt='Song Cover' className='album-cover' />
                <div className='album-info'>
                  <span className='album-title'>Anti-Hero</span>
                  <span className='album-artist'>Taylor Swift</span>
                </div>
              </div>
              <div className='see-more'>
                <button className='more-content'>See more</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Dashboard;