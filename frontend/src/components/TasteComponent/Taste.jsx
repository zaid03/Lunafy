import React, {useState, useEffect} from 'react';
import './TasteStyle.css'
import Header from '../HeaderComponent';
import Footer from '../FooterComponent';
import ShareImage from '../ShareImageComponent/ShareImage';
import { useNavigate } from 'react-router-dom';

function Taste() {

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

    const [shareModal, setShareModal] = useState({ isOpen: false, type: '', data: [] });
    
    const handleShare = () => {
        const insightText = `
            Your favorite artist is ${tasteData.topArtist}, and your most played song is "${tasteData.topSong}".
            You listen mostly to ${tasteData.topGenre} music, with an average track popularity of ${tasteData.avgPopularity}.
            You’ve explored ${tasteData.uniqueArtists?.[0]?.uniqueArtists} different artists this month!
        `;
        setShareModal({ isOpen: true, type: 'Taste', data: [insightText] });
    };

    const closeShareModal = () => {
    setShareModal({ isOpen: false, type: '', data: [] });
    };


    const [tasteData, setTasteData] = useState({
        topArtist: '',
        topSong: '',
        topGenre: '',
        avgPopularity: '',
        uniqueArtists: ''
    });
    useEffect(() => {
        fetch(`http://127.0.0.1:5000/api/music-insight`, {credentials: 'include'})
        .then(res => res.json())
        .then(data => {
            setTasteData({
                topArtist: data.topArtist?.[0]?.topArtist || '',
                topSong: data.topSong?.[0]?.topSong || '',
                topGenre: data.topGenre?.[0]?.genre || '',
                avgPopularity: data.avgPopularity || '',
                uniqueArtists: data.uniqueArtists || ''
            });
        })
        .catch(err => console.error('Error fetching duration data:', err));
    }, []);
    
    return (
        <>
            <Header />
            <div className='taste-container'>
                <div className='page-button'>
                    <button className='butt' onClick={handleShare}>Share</button>
                </div>
                
                <div className='page-content'>
                    <div className='text-center'>
                        <p>
                            Your favorite artist is <span className='diff'>{tasteData.topArtist}</span>, and your most played song is "<span className='diff'>{tasteData.topSong}</span>". 
                        </p>
                        <p>
                            You listen mostly to <span className='diff'>{tasteData.topGenre}</span> music, with an average track popularity of <span className='diff'>{tasteData.avgPopularity}</span>.
                        </p>
                        <p>
                            You listen most to <span className='diff'>{tasteData.topGenre}</span> music,and you’ve explored <span className='diff'>{tasteData.uniqueArtists?.[0]?.uniqueArtists}</span> different artists this month!
                        </p>
                    </div>
                </div>
                <Footer />
            </div>
            
            {shareModal.isOpen && (
                <ShareImage
                    data={shareModal.data}
                    type={shareModal.type}
                    onClose={closeShareModal}
                />
            )}
        </>
    )
}

export default Taste;