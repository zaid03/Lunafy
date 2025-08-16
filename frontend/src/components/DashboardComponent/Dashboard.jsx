import React, { useState ,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import './Dashboard.css';
import { NavLink } from 'react-router-dom';
import Footer from '../FooterComponent';
import test from '../../assets/bbcone.png';

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

  const [albumsData, setAlbumsData] = useState([]);
  const [artistsData, setArtistsData] = useState([]);
  const [songsData, setSongsData] = useState([]);

  useEffect(() => {
  // First save data, then get overview
  fetch('http://127.0.0.1:5000/api/user-stats', { credentials: 'include' })
    .then(() => {
      return fetch('http://127.0.0.1:5000/api/dashboard-overview', { credentials: 'include' });
    })
    .then(res => res.json())
    .then(data => {
      if (data.artists) setArtistsData(data.artists);
      if (data.albums) setAlbumsData(data.albums);
      if (data.songs) setSongsData(data.songs);
    })
    .catch(err => console.error('Error:', err));
}, []);
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
                <img src={userData?.profileImage} alt='user-pic' />
                <span className='user-name'>{userData?.display_name || userData?.name || "User"}</span>
              </div>
            </div>
            <div className='playing-now'>
              {userData?.playingNow ? (
                <div className='content-all' style={{ cursor: userData?.playingNow?.preview_url ? 'pointer' : 'default' }} onClick={handlePlayPreview}>
                  <img className='test'
                    src={userData.playingNow.albumImage}
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
            <option value="volvo">Short range</option>
            <option value="saab">Medium range</option>
            <option value="opel">Long range</option>
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
              {artistsData.length > 0 ? (
                artistsData.map((artist, index) => (
                  <div key={artist.artist_id} className='artist-item'>
                    <span className='artist-rank'>{index + 1}</span>
                    <img src={artist.image_url} alt='Artist' className='artist-pfp' />
                    <span className='artist-name'>{artist.artist_name}</span>
                  </div>
                ))
              ) : (
                <div className='artist-item'>
                  <span className='artist-rank'>-</span>
                  <span className='artist-name'>Loading artists...</span>
                </div>
              )}
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
              {songsData.length > 0 ? (
                songsData.map((song, index) => (
                  <div key={index} className='song-item'>
                    <span className='song-rank'>{song.rank_position}</span>
                    <img src={song.image_url} alt='Song Cover' className='song-cover' />
                    <div className='song-info'>
                      <span className='song-title'>{song.track_name}</span>
                      <span className='song-artist'>{song.artist_name}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className='song-item'>
                  <span className='song-rank'>-</span>
                  <div className='song-info'>
                    <span className='song-title'>Loading songs...</span>
                    <span className='song-artist'>Please wait</span>
                  </div>
                </div>
              )}
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
              {albumsData.length > 0 ? (
                albumsData.map((album, index) => (
                  <div key={album.album_id} className='album-item'>
                    <span className='album-rank'>{index + 1}</span>
                    <img 
                      src={album.image_url} 
                      alt='Album Cover' 
                      className='album-cover' 
                    />
                    <div className='album-info'>
                      <span className='album-title'>{album.album_name}</span>
                      <span className='album-artist'>{album.artist_name}</span>
                    </div>
                  </div>
                ))
              ) : (
              <div className='album-item'>
                <span className='album-rank'>-</span>
                <div className='album-info'>
                  <span className='album-title'>Loading albums...</span>
                  <span className='album-artist'>Please wait</span>
                </div>
              </div>
            )}
            <div className='see-more'>
              <button className='more-content'>See more</button>
            </div>
          </div>
        </div>
      </div>
      <div className='misc'>
        <h4>Taste</h4>
        <div className='taste'>
            <div className='popularity'>
              <h8>most popular song</h8>
              <div className='the-song'>
                <img src={test} alt='song' />
                <span>name of the song</span>
              </div>
            </div>
            <div className='decade'>
              <h8>Top in 2020s</h8>
              <div className='the-song'>
                <img src={test} alt='song' />
                <span>name of the song</span>
              </div>
              <h8>Top in 2010s</h8>
              <div className='the-song'>
                <img src={test} alt='song' />
                <span>name of the song</span>
              </div>
              <h8>Top in 2000s</h8>
              <div className='the-song'>
                <img src={test} alt='song' />
                <span>name of the song</span>
              </div>
            </div>
            <div className='length'>
              <h8>Longest</h8>
              <div className='the-song'>
                <img src={test} alt='song' />
                <span>name of the song</span>
              </div>
              <h8>Shortest</h8>
              <div className='the-song'>
                <img src={test} alt='song' />
                <span>name of the song</span>
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