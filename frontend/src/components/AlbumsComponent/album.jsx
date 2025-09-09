import React, {useState, useEffect} from 'react';
import Header from '../HeaderComponent';
import Footer from '../FooterComponent';
import { useNavigate } from 'react-router-dom';
import ShareImage from '../ShareImageComponent/ShareImage';

function Album () {
    const navigate = useNavigate();
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

    const [timeRange, setTimeRange] = useState('medium_term');
        const handleTimeRangeChange = (event) => {
        const newTimeRange = event.target.value;
        setTimeRange(newTimeRange);
    }

    const [albumData, setAlbumData] = useState([]);
    useEffect(() => {
        setAlbumData([]);
        fetch(`http://127.0.0.1:5000/api/top-all-albums?timeRange=${timeRange}`, {credentials: 'include'})
        .then(res => res.json())
        .then(data => {
            setAlbumData(data.albums);
        })
        .catch(err => console.error('Error fetching albums data:', err));
    }, [timeRange]);

    const [shareModal, setShareModal] = useState({ isOpen: false, type: '', data: [] });

    const handleShare = () => {
    setShareModal({ isOpen: true, type: 'albums', data: albumData });
    };

    const closeShareModal = () => {
    setShareModal({ isOpen: false, type: '', data: [] });
    };

    const uniqueAlbums = [];
    const seen = new Set();
    for (const album of albumData) {
        const key = album.album_name + '|' + album.artist_name;
        if (!seen.has(key)) {
            uniqueAlbums.push(album);
            seen.add(key);
        }
    }

    return (
        
        <>
            <Header />
            <div className='artist-container'>
                <div className='time-periode'>
                    <select id="period" value={timeRange} onChange={handleTimeRangeChange}>
                        <option value="short_term">Short range</option>
                        <option value="medium_term">Medium range</option>
                        <option value="long_term">Long range</option>
                    </select>
                    <button className='save-all' onClick={handleShare}>Share</button>
                </div>
                <div className='display-artists'>
                    {uniqueAlbums && uniqueAlbums.length > 0 ? (
                        uniqueAlbums.map((album, idx) => (
                            <div key={album.album_id || idx}className='artist-content'>
                                <div className='artist-rank-all'>
                                    #{idx + 1}
                                </div>
                                <div className='artist-image'>
                                    <img src={album.image_url} alt={album.album_url} />
                                </div>
                                <div className='artist-info-all'>
                                    <a
                                        href={album.album_id ? `https://open.spotify.com/album/${album.album_id}` : '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className='song-name'
                                        style={{ textDecoration: 'none' }}
                                    >
                                        {album.album_name}
                                    </a>
                                    <div className='artist-name-all'>
                                        {album.artist_name}
                                    </div>
                                </div>
                            </div>
                        ))
                    ): (
                        <h1
                        className='warningTest'
                        style={{
                            gridColumn: '1 / -1',
                            width: '100%',
                            textAlign: 'center',
                            margin: '40px 0'
                        }}
                        >
                        No Album data yet. Start listening to music on Spotify to see your stats here!
                        </h1>
                    )}
                </div>
                <div className='footer-all'>
                    <Footer />
                </div>
            </div>
            {shareModal.isOpen && (
                <ShareImage
                    data={shareModal.data}
                    type={shareModal.type}
                    timeRange={timeRange}
                    onClose={closeShareModal}
                />
            )}
        </>
    )
}

export default Album;