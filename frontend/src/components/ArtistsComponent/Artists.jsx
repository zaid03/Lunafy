import React, {useState, useEffect} from 'react';
import './Artist.css';
import Header from "../HeaderComponent";
import Footer from "../FooterComponent";
import { useNavigate } from 'react-router-dom';

function Artists() {

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

    const [artistData, setArtistData] = useState([]);
    useEffect(() => {
        fetch(`http://127.0.0.1:5000/api/top-all-artists?timeRange=${timeRange}`, {credentials: 'include'})
        .then(res => res.json())
        .then(data => {
            setArtistData(data.artists);
        })
        .catch(err => console.error('Error fetching duration data:', err));
    }, [timeRange]);

    return (
        < >
            <Header />
            <div className="artist-container">
                <div className='time-periode'>
                    <select id="period" value={timeRange} onChange={handleTimeRangeChange}>
                        <option value="short_term">Short range</option>
                        <option value="medium_term">Medium range</option>
                        <option value="long_term">Long range</option>
                    </select>
                </div>
                <div className='display-artists'>
                    {artistData.map((artist, idx) => (
                        <div key={artist.artist_id || idx}className='artist-content'>
                            <div className='artist-rank-all'>
                                #{idx + 1}
                            </div>
                            <div className='artist-image'>
                                <img src={artist.image_url} alt={artist.main_artist} />
                            </div>
                            <div className='artist-info-all'>
                                <a
                                    href={
                                        artist.artist_id
                                        ? `https://open.spotify.com/artist/${artist.artist_id.split(':').pop()}`
                                        : '#'
                                    }
                                    className='artist-name-all'
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    >
                                    {artist.main_artist}
                                </a>
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

export default Artists;