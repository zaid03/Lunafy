import React, {useState, useEffect} from 'react';
import Header from '../HeaderComponent';
import Footer from '../FooterComponent';
import './Genere.css';
import { useNavigate } from 'react-router-dom';

function Genre() {
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

    const [genreData, setGenreData] = useState([]);
    useEffect(() => {
        fetch(`http://127.0.0.1:5000/api/top-all-genres?timeRange=${timeRange}`, {credentials: 'include'})
        .then(res => res.json())
        .then(data => {
            console.log(data);
            setGenreData(data.genres);
        })
        .catch(err => console.error('Error fetching albums data:', err));
    }, [timeRange]);

    return (
        <>  
            <div className='artist-container'>
                <Header />
                <div className='time-periode'>
                    <select id="period" value={timeRange} onChange={handleTimeRangeChange}>
                        <option value="short_term">Short range</option>
                        <option value="medium_term">Medium range</option>
                        <option value="long_term">Long range</option>
                    </select>
                </div>
                <div className='mlwiya'>
                    <h2>Top Genres</h2>
                    <div className='display-genres'>
                        <ul>
                            {genreData && genreData.length > 0 ? (
                                genreData.map((item, idx) => (
                                    <li key={item.genres + idx} data-rank={idx + 1}>
                                        {item.genres}
                                    </li>
                                ))
                            ) : (
                                <li>No genre data available.</li>
                            )}
                        </ul>
                    </div>
                </div>
                <div className='footer-all'>
                    <Footer />
                </div>
            </div>
        </>
    )
}

export default Genre;