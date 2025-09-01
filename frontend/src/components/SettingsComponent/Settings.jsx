import React, { useEffect, useState } from 'react';
import countryList from 'react-select-country-list';
import './settings.css';
import Header from '../HeaderComponent';
import Footer from '../FooterComponent';
import { useNavigate } from 'react-router-dom';

function Settings() {

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

    const [showBioInput, setShowBioInput] = useState(false);
    const [bio, setBio] = useState('');
    const [bioMsg, setBioMsg] = useState('');
    const [country, setCountry] = useState('');
    const options = countryList().getData();
    const [countryMsg, setCountryMsg] = useState('');

    const handleRefreshProfile = () => {
        navigate('/dashboard');
    };

    useEffect(() => {
        fetch(`http://127.0.0.1:5000/api/bio-get`, {credentials: 'include'})
        .then(res => res.json())
        .then(data => {
            setBio(data.bio[0]?.bio || '');
        })
    }, []);

    return (
        <>
            <Header />
            <div className="settings-container">
                <h2 className="settings-title">Settings</h2>

                <div className="settings-section">
                    <h3>Bio</h3>
                    <p>Add a short bio to personalize your profile.</p>
                    <div className="settings-row">
                        <button className="settings-btn" onClick={() => setShowBioInput(!showBioInput)}>
                            {showBioInput ? 'Close' : 'Edit Bio'}
                        </button>
                    </div>
                    {showBioInput && (
                        <>
                            <textarea
                                className='settings-input-wide'
                                placeholder='Type your bio here...'
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                            >
                                {bio}
                            </textarea>
                            <button
                                className='settings-btn'
                                onClick={() => {
                                    fetch('http://127.0.0.1:5000/api/csrf-token', { credentials: 'include' })
                                        .then(res => res.json())
                                        .then(tokenData => {
                                            fetch('http://127.0.0.1:5000/api/user-bio', {
                                                method: 'POST',
                                                credentials: 'include',
                                                headers: { 
                                                    'Content-Type': 'application/json',
                                                    'X-CSRF-Token': tokenData.csrfToken
                                                 },
                                                body: JSON.stringify({ bio })
                                            })
                                            .then(res => res.json())
                                            .then(data => {
                                                setShowBioInput(false);
                                                setBioMsg('Bio updated!');
                                                setTimeout(() => setBioMsg(''), 2000);
                                            });
                                        })
                                    }}
                            >
                                Save
                            </button>
                            
                        </>
                        
                    )}
                    {bioMsg && <h6 className="success">{bioMsg}</h6>}
                </div>

                <div className="settings-section">
                    <h3>Country</h3>
                    <p>Select your country.</p>
                    <div className="settings-row">
                        <select
                        className="settings-input"
                        value={country}
                        onChange={e => {
                            setCountry(e.target.value);
                            fetch('http://127.0.0.1:5000/api/csrf-token', { credentials: 'include' })
                                .then(res => res.json())
                                .then(tokenData => {
                                    fetch('http://127.0.0.1:5000/api/user-country', {
                                        method: 'POST',
                                        credentials: 'include',
                                        headers: { 
                                            'Content-Type': 'application/json',
                                            'X-CSRF-Token': tokenData.csrfToken
                                        },
                                        body: JSON.stringify({ country: e.target.value })
                                    })
                                    .then(res => res.json())
                                    .then(data => {
                                        setCountryMsg('Country updated!');
                                        setTimeout(() => setCountryMsg(''), 2000);
                                    });
                                })
                            }}
                        >
                        <option value="">Choose country</option>
                        {options.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                        </select>
                    </div>
                    {countryMsg && <h6 className="success">{countryMsg}</h6>}
                </div>

                <div className="settings-section">
                    <h3>Refresh Profile</h3>
                    <p>Reload your profile information.</p>
                    <button className="settings-btn settings-refresh" onClick={handleRefreshProfile}>
                        Refresh Profile
                    </button>
                </div>
                <Footer />
            </div>
        </>
    );
}

export default Settings;