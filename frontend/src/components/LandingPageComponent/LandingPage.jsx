import React, { useRef, useEffect, useState } from 'react';
import {Link} from 'react-router-dom';
import './LandingPage.css';
import logo from '../../assets/logo.png';
import spotify from '../../assets/spotify.png';
import demo from '../../assets/demo.png';
import white from '../../assets/white-spotify.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic, faUser, faCompactDisc, faRobot } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';


function LandingPage() {
    useEffect(() =>{
        console.log("am loaded");
    }, []);

    const [formData, setformData] = useState({
        name: '',
        email: '',
        message: '',
    });

    const handlechange = (e) => {
        setformData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('http://localhost:5000/api/data', {
                method: 'POST',
                headers: {
                    'content-type':'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if(response.ok){
                console.log("message sent");
                setformData({
                    name: '',
                    email: '',
                    message: '',
                });
            } else {
                console.log(data.message || "failed to send");
            }
        } catch (e) {
            console.error('error:', e);
            console.log('failed to send message');
        }
    };

    const featuresRef = useRef(null);
    const contactRef = useRef(null);
    const scrollToFeatures = () => {
        featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    const scrollToContact = () => {
        contactRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className='container'>
            <div className='header'>
                <div className='nav-bar'>
                    <div className='logo-name'>
                        <img src={logo} alt='Lunafy logo' />
                        <span className='name'>Lunafy</span>
                    </div>
                    <div className='navigation'>
                        <span onClick={scrollToFeatures} style={{cursor: 'pointer'}}>Features</span>
                        <span onClick={scrollToContact} style={{cursor: 'pointer'}}>Contact us</span>
                    </div>
                    <div className='login'>
                        <Link to='/Auth' className='login-btn'><img src={spotify} alt='Spotify icon by Icons8' className='spotify'/> Login with spotify</Link>
                    </div>
                </div>

                <div className='header-content'>
                    <div className='left'>
                        <h1>Spotify stats</h1>
                        <h2 className='tailor'>Tailored for you</h2>
                        <p>Connect your Spotify account and get detailed insights about your listening habits.</p>
                        <Link to='/Auth' className='login-btn'><img src={white} alt='Spotify icon by Icons8' className='spotify'/> Login with spotify</Link>
                        <p className='conditions'>By clicking Login, you agree to our <Link to='/terms' className='terms'>Terms of Services</Link> and <Link to='/privacy' className='privacy'>Privacy Policy</Link> </p>
                    </div>
                    
                    <div className='right'>
                        <img src={demo} alt='screenshot or video from the website' />
                    </div>
                </div>
            </div>


            <div className='discover' ref={featuresRef}>
                <h3>Uncover Who You Are — One Song At A Time</h3>

                <div className='cards-container'>
                    <div className='card'>
                        <FontAwesomeIcon icon={faMusic} />
                        <h1>Top track</h1>
                        <p>Discover your most played songs across diffrent time periods</p>
                    </div>
                    <div className='card'>
                        <FontAwesomeIcon icon={faUser} />
                        <h1>Top artists</h1>
                        <p>Discover what artists you listen the most</p>
                    </div>
                    <div className='card'>
                        <FontAwesomeIcon icon={faCompactDisc} />
                        <h1>Top genres</h1>
                        <p>Discover how you favourite genre changes depending on your mood</p>
                    </div>
                    <div className='card'>
                        <FontAwesomeIcon icon={faRobot} />
                        <h1>Music Personality</h1>
                        <p>Discover your personality through music, powered by smart AI analysis.</p>
                    </div>
                </div>
            </div>
            
            <div className='contact' ref={contactRef}>
                <form onSubmit={handleSubmit}>
                    <input 
                        type='text'
                        name='name'
                        value={formData.name}
                        onChange={handlechange}
                        placeholder='Enter your name'
                    />
                    <input 
                        type='email'
                        name='email'
                        value={formData.email}
                        onChange={handlechange}
                        placeholder='Enter your email'
                    />
                    <textarea 
                        name='message'
                        value={formData.message}
                        onChange={handlechange}
                        placeholder='Enter your message'
                    />
                    <button type="submit">Submit</button>
                </form>
            </div>

            <div className='footer'>
                <div className='nav'>
                    <span onClick={scrollToFeatures} style={{cursor: 'pointer'}}>Features</span>
                    <span onClick={scrollToContact} style={{cursor: 'pointer'}}>Contact us</span>
                </div>

                <Link to='/Auth' className='login-btn'><img src={spotify} alt='Spotify icon by Icons8' className='spotify'/> Login with spotify</Link>

                <div className='social'>
                    <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faGithub} />
                    </a>
                     <a href="https://linkedin.com/in/yourprofile" target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faLinkedin} />
                    </a>
                </div>
                <div className='misc'>
                    <p>© 2025 Lunafy — Crafted with ♫ and ☕</p>
                    <p>Made with ❤️ in Morocco</p>
                </div>
                
            </div>
        </div>
    );
}

export default LandingPage;