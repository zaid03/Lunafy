import React, {useState, useEffect} from 'react';
import './TasteStyle.css'
import Header from '../HeaderComponent';
import Footer from '../FooterComponent';
import ShareImage from '../ShareImageComponent/ShareImage';

function Taste() {

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

    const [shareModal, setShareModal] = useState({ isOpen: false, type: '', data: [] });
    
    const handleShare = () => {
    // setShareModal({ isOpen: true, type: 'artists', data: artistData }); 
    };

    const closeShareModal = () => {
    setShareModal({ isOpen: false, type: '', data: [] });
    };


    const [tasteData, setTasteData] = useState([]);
    useEffect(() => {
        fetch(`http://127.0.0.1:5000/api/music-insight`, {credentials: 'include'})
        .then(res => res.json())
        .then(data => {
            setTasteData(data.artists);
        })
        .catch(err => console.error('Error fetching duration data:', err));
    });
    
    return (
        <>
            <Header />
            <div className='taste-container'>
                <div className='page-button'>
                    <button className='butt'>Discover your Taste</button>
                    <button className='butt' onClick={handleShare}>Share</button>
                </div>
                
                <div className='page-content'>
                    <div className='text-center'>
                        <p>Zaid Terguy, huh? I see we’re dealing with a man who has somehow made a career out of listening to music that sounds like it was produced in a Moroccan food truck. Seriously, you've got more 'Pop' in your playlist than a teenager at a summer festival, and your taste is so niche it makes hipsters look mainstream. It's like you took a world tour and somehow ended up at a Moroccan wedding, where every track is guaranteed to make you question your life choices. You must be a real hit at parties—instead of breaking the ice, you’re just freezing everyone out with your obscure genre selections. 
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