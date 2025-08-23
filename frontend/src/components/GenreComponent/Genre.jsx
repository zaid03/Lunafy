import React, {useState} from 'react';
import Header from '../HeaderComponent';
import Footer from '../FooterComponent';

function Genre() {
    // const navigate = useNavigate();
    // useEffect(() => {
    //     fetch('http://127.0.0.1:5000/api/test-session', {
    //       credentials: 'include',
    //     })
    //       .then(res => res.json())
    //       .then(data => {
    //         if (!data.userId) {
    //           navigate('/');
    //         }
    //       })
    //       .catch(() => {
    //         navigate('/');
    //       });
    //   }, [navigate]);

    const [timeRange, setTimeRange] = useState('medium_term');
        const handleTimeRangeChange = (event) => {
        const newTimeRange = event.target.value;
        setTimeRange(newTimeRange);
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
                </div>
                <div className='footer-all'>
                    <Footer />
                </div>
            </div>
        </>
    )
}

export default Genre;