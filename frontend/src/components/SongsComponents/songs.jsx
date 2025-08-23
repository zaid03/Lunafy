import React, {useState, useEffect} from 'react';
import Header from "../HeaderComponent";
import Footer from "../FooterComponent";
import { useNavigate } from 'react-router-dom';

function Songs () {
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

    const [songData, setSongData] = useState([]);
    useEffect(() => {
        fetch(`http://127.0.0.1:5000/api/top-all-songs?timeRange=${timeRange}`, {credentials: 'include'})
        .then(res => res.json())
        .then(data => {
            setSongData(data.songs);
        })
        .catch(err => console.error('Error fetching duration data:', err));
    }, [timeRange]);

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
                </div>
                <div className='display-artists'>
                    {songData.map((song, idx) => (
                        <div key={song.artist_id || idx}className='artist-content'>
                            <div className='artist-rank-all'>
                                #{idx + 1}
                            </div>
                            <div className='artist-image'>
                                <img src={song.image_url} alt={song.artist_name} />
                            </div>
                            <div className='artist-info-all'>
                                <a
                                    href={song.external_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className='song-name'
                                    style={{textDecoration: 'none'}}
                                >
                                    {song.track_name}
                                </a>
                                <div className='artist-name-all'>
                                    {song.artist_name}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='footer-all'>
                    <Footer />
                </div>
            </div>
            
        </>
    )
}

export default Songs;