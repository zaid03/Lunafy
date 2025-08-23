import React, {useState} from 'react';
import './Artist.css';
import Header from "../HeaderComponent";
import Footer from "../FooterComponent";
import bbcone from '../../assets/bbcone.png';

function Artists() {

    const [timeRange, setTimeRange] = useState('medium_term');
        const handleTimeRangeChange = (event) => {
        const newTimeRange = event.target.value;
        setTimeRange(newTimeRange);
    }

    const staticArtists = Array.from({ length: 50 }, (_, index) => ({
        id: index + 1,
        name: [
            "The Weeknd", "Drake", "Billie Eilish", "Taylor Swift", "Ed Sheeran",
            "Ariana Grande", "Post Malone", "Dua Lipa", "Harry Styles", "Olivia Rodrigo",
            "Justin Bieber", "Bad Bunny", "BTS", "Doja Cat", "The Chainsmokers",
            "Imagine Dragons", "Maroon 5", "OneRepublic", "Coldplay", "Bruno Mars",
            "Eminem", "Kendrick Lamar", "Travis Scott", "Future", "21 Savage",
            "Lil Baby", "Roddy Ricch", "DaBaby", "Pop Smoke", "Juice WRLD",
            "XXXTentacion", "Lil Uzi Vert", "Playboi Carti", "Tyler, The Creator", "Frank Ocean",
            "SZA", "H.E.R.", "Summer Walker", "Jhené Aiko", "Kehlani",
            "The Kid LAROI", "Machine Gun Kelly", "Polo G", "Lil Durk", "NBA YoungBoy",
            "Gunna", "Young Thug", "Lil Wayne", "Nicki Minaj", "Cardi B"
        ][index % 50],
        image: bbcone,
        rank: index + 1
    }));

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
                    {staticArtists.map((artist) => (
                        <div key={artist.id} className='artist-content'>
                            <div className='artist-rank-all'>
                                #{artist.rank}
                            </div>
                            <div className='artist-image'>
                                <img src={artist.image} alt={artist.name} />
                            </div>
                            <div className='artist-info-all'>
                                <h3 className='artist-name-all'>{artist.name}</h3>
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