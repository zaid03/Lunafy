import React, { useState ,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import './Dashboard.css';
import { NavLink } from 'react-router-dom';
import Footer from '../FooterComponent';
import ShareImage from '../ShareImageComponent/ShareImage';
import PlaylistCreator from '../PlaylistCreatorComponent/PlaylistCreator';

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

  const [audio, setAudio] = useState(null);
  const handlePlayPreview = () => {
    if (!userData?.playingNow?.preview_url) return;
    if (audio) {
      audio.pause();
      setAudio(null);
    } else {
      const newAudio = new Audio(userData.playingNow.preview_url);
      newAudio.play();
      setAudio(newAudio);
      newAudio.onended = () => {
        setAudio(null);
      };
    }
  };

  const [albumsData, setAlbumsData] = useState([]);
  const [artistsData, setArtistsData] = useState([]);
  const [songsData, setSongsData] = useState([]);

  const [timeRange, setTimeRange] = useState('medium_term');
  const handleTimeRangeChange = (event) => {
    const newTimeRange = event.target.value;
    setTimeRange(newTimeRange);
  }
  
  useEffect(() => {
    setAlbumsData([]);
    setArtistsData([]); 
    setSongsData([]);
    if (localStorage.getItem('shouldFetchSpotifyData') === 'true') {
      fetch('http://127.0.0.1:5000/api/user-stats', { credentials: 'include' })
        .then(() => {
          localStorage.setItem('shouldFetchSpotifyData', 'false');
          return fetch(`http://127.0.0.1:5000/api/dashboard-overview?timeRange=${timeRange}`, { credentials: 'include' });
        })
        .then(res => res.json())
        .then(data => {
          if (data.artists) setArtistsData(data.artists);
          if (data.albums) setAlbumsData(data.albums);
          if (data.songs) setSongsData(data.songs);
        })
        .catch(err => console.error('Error:', err));
    } else {
      fetch(`http://127.0.0.1:5000/api/dashboard-overview?timeRange=${timeRange}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.artists) setArtistsData(data.artists);
          if (data.albums) setAlbumsData(data.albums);
          if (data.songs) setSongsData(data.songs);
        })
        .catch(err => console.error('Error:', err));
    }
  }, [timeRange]);

  const uniqueAlbums = [];
    const seen = new Set();
    for (const album of albumsData) {
        const key = album.album_name + '|' + album.artist_name;
        if (!seen.has(key)) {
            uniqueAlbums.push(album);
            seen.add(key);
        }
    }

  const [popularData, setPopularData] = useState([]);
  const [durationData, setDurationData] = useState([]);
  const [decadeData, setDecadeData] = useState([]);

  // Fetch most/least popular songs
  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/most-least-pop?timeRange=${timeRange}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setPopularData(data);
      })
      .catch(err => console.error('Error fetching popular data:', err));
  }, [timeRange]);

  // Fetch longest/shortest songs
  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/longest-shortest-song?timeRange=${timeRange}`, {credentials: 'include'})
      .then(res => res.json())
      .then(data => {
        setDurationData(data);
      })
      .catch(err => console.error('Error fetching duration data:', err));
  }, [timeRange]);

  // Fetch top songs by decade
  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/top-by-decade?timeRange=${timeRange}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setDecadeData(data);
      })
      .catch(err => console.error('Error fetching decade data:', err));
  }, [timeRange]);

  const [shareModal, setShareModal] = useState({ isOpen: false, type: '', data: [] });

  const handleShare = (type) => {
    let data = [];
    switch(type) {
      case 'artists':
        data = artistsData;
        break;
      case 'songs':
        data = songsData;
        break;
      case 'albums':
        data = albumsData;
        break;
      default:
        return;
    }
    setShareModal({ isOpen: true, type, data });
  };

  const closeShareModal = () => {
    setShareModal({ isOpen: false, type: '', data: [] });
  };


  const [playlistModal, setPlaylistModal] = useState({ isOpen: false });

  const handleCreatePlaylist = () => {
    setPlaylistModal({ isOpen: true });
  };

  const closePlaylistModal = () => {
    setPlaylistModal({ isOpen: false });
  };

  const handlePlaylistSuccess = (playlist) => {
    alert(`Playlist "${playlist.name}" created successfully with ${playlist.tracks_added} songs!`);
    // Optionally open the playlist in Spotify
    if (playlist.url) {
      window.open(playlist.url, '_blank');
    }
  };

  const [bio, setBio] = useState('');
  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/bio-get`, {credentials: 'include'})
    .then(res => res.json())
    .then(data => {
        setBio(data.bio[0]?.bio || '');
    })
  }, []);

  return (
    <div className='container-dash'>
      <div className='header-dash'>
        <div className='nav-bar-dash'>
          <div className='logo-name-dash'>
            <img src={logo} alt='Lunafy logo' />
            <a href='/dashboard' className='name-dash'>Lunafy</a>
          </div>
          <div className='burger-menu'>
            <div className='burger' onClick={() => setMenuOpen(!menuOpen)}>
              <div className='bar'></div>
              <div className='bar'></div>
              <div className='bar'></div>
            </div>
            {menuOpen && (
              <div className='menu'>
                <a href='/profile'>Profile</a>
                <a href='/settings'>Settings</a>
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
                <div className='bio-name'>
                  <span className='user-name'>{userData?.display_name || userData?.name || "User"}</span>
                  <span>{bio}</span>
                </div>
                
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
            <NavLink to="/Artists" className="dashboard-link">Artists</NavLink>
            <NavLink to="/songs" className="dashboard-link">Songs</NavLink>
            <NavLink to="/albums" className="dashboard-link">Albums</NavLink>
            <NavLink to="/genres" className="dashboard-link">Genres</NavLink>
            <NavLink to="/taste" className="dashboard-link">Dicover your taste</NavLink>
          </div>
        </div>
      </div>

      <div className='stats-content'>
        <div className='time-periode'>
          <select id="period" value={timeRange} onChange={handleTimeRangeChange}>
            <option value="short_term">Short range</option>
            <option value="medium_term">Medium range</option>
            <option value="long_term">Long range</option>
          </select>
        </div>

        <div className='top-cards'>
          <div className='top-artists'>
            <div className='button-songs'>
              <h3>Top Artists</h3>
              <div className='more'>
                <button className='save' onClick={() => handleShare('artists')}>Share</button>
              </div>
            </div>
            <div className='artists-list'>
              {artistsData.length > 0 ? (
                artistsData.map((artist, index) => (
                  <div key={artist.artist_id} className='artist-item'>
                    <span className='artist-rank'>{artist.best_track_rank}</span>
                    <img src={artist.image_url} alt='Artist' className='artist-pfp' />
                    <span className='artist-name'>{artist.main_artist}</span>
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
                <button className='save' onClick={handleCreatePlaylist}>Save as Playlist</button>
                <button className='save' onClick={() => handleShare('songs')}>Share</button>
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
                      <span className='song-artist'>{song.artist_name.split(',')[0].trim()}</span>
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
                <button className='save' onClick={() => handleShare('albums')}>Share</button>
              </div>
            </div>
            <div className='album-list'>
              {uniqueAlbums.length > 0 ? (
                uniqueAlbums.map((album, index) => (
                  <div key={album.album_id} className='album-item'>
                    <span className='album-rank'>{index + 1}</span>
                    <img 
                      src={album.image_url} 
                      alt='Album Cover' 
                      className='album-cover' 
                    />
                    <div className='album-info'>
                      <span className='album-title'>{album.album_name}</span>
                      <span className='album-artist'>{album.artist_name.split(',')[0].trim()}</span>
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
              <h5>Most popular</h5>
              <div className='the-song'>
                <div className='image-song'>
                  <img src={popularData?.mostPopular?.image_url} alt='song' />
                </div>
                <div className='details-song'>
                  <span className='name-song'>{popularData?.mostPopular?.track_name}</span>
                  <span className='name-artist'>{popularData?.mostPopular?.artist_name.split(',')[0].trim()}</span>
                </div>
              </div>
              <h5>Least popular</h5>
              <div className='the-song'>
                <div className='image-song'>
                  <img src={popularData?.leastPopular?.image_url} alt='song' />
                </div>
                <div className='details-song'>
                  <span className='name-song'>{popularData?.leastPopular?.track_name}</span>
                  <span className='name-artist'>{popularData?.leastPopular?.artist_name.split(',')[0].trim()}</span>
                </div>
              </div>
            </div>
            <div className='decade'>
              <h5>Top in 2020s</h5>
              <div className='the-song'>
                <div className='image-song'>
                  <img src={decadeData?.decade2020s?.image_url || 'Not available'} alt='song' />
                </div>
                <div className='details-song'>
                  <span className='name-song'>{decadeData?.decade2020s?.track_name || 'Not available'}</span>
                  <span className='name-artist'>{decadeData?.decade2020s?.artist_name.split(',')[0].trim() || 'Not available'}</span>
                </div>
              </div>
              <h5>Top in 2010s</h5>
              <div className='the-song'>
                <div className='image-song'>
                  <img src={decadeData?.decade2010s?.image_url || 'Not available'} alt='song' />
                </div>
                <div className='details-song'>
                  <span className='name-song'>{decadeData?.decade2010s?.track_name || 'Not available'}</span>
                  <span className='name-artist'>{decadeData?.decade2010s?.artist_name.split(',')[0].trim() || 'Not available'}</span>
                </div>
              </div>
              {/* <h5>Top in 2000s</h5>
              <div className='the-song'>
                <div className='image-song'>
                  <img src={test} alt='song' />
                </div>
                <div className='details-song'>
                  <span className='name-song'>name of the song</span>
                  <span className='name-artist'>name of the Artist</span>
                </div>
              </div> */}
            </div>
            <div className='length'>
              <h5>Longest</h5>
              <div className='the-song'>
                <div className='image-song'>
                  <img src={durationData?.longest?.image_url || 'Not available'} alt='song' />
                </div>
                <div className='details-song'>
                  <span className='name-song'>{durationData?.longest?.track_name || 'Not available'}</span>
                  <span className='name-artist'>{durationData?.longest?.artist_name.split(',')[0].trim() || 'Not available'}</span>
                </div>
              </div>
              <h5>Shortest</h5>
              <div className='the-song'>
                <div className='image-song'>
                  <img src={durationData?.shortest?.image_url || 'Not available'} alt='song' />
                </div>
                <div className='details-song'>
                  <span className='name-song'>{durationData?.shortest?.track_name || 'Not available'}</span>
                  <span className='name-artist'>{durationData?.shortest?.artist_name.split(',')[0].trim() || 'Not available'}</span>
                </div>
              </div>  
            </div>
        </div>
      </div>
    </div>
    {playlistModal.isOpen && (
      <PlaylistCreator 
        timeRange={timeRange}
        onClose={closePlaylistModal}
        onSuccess={handlePlaylistSuccess}
      />
    )}
    {shareModal.isOpen && (
      <ShareImage 
        data={shareModal.data}
        type={shareModal.type}
        timeRange={timeRange}
        onClose={closeShareModal}
      />
    )}
    <Footer />
    </div>
  );
}

export default Dashboard;