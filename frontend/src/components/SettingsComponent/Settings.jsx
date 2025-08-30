import React, { useState } from 'react';
import countryList from 'react-select-country-list';
import './settings.css';
import Header from '../HeaderComponent';
import Footer from '../FooterComponent';

function Settings() {

    const [showBioInput, setShowBioInput] = useState(false);
    const [bio, setBio] = useState('');
    const [country, setCountry] = useState('');
    const [refreshMsg, setRefreshMsg] = useState('');
    const options = countryList().getData();

    const handleRefreshProfile = () => {
        setRefreshMsg('Profile refreshed!');
        setTimeout(() => setRefreshMsg(''), 2000);
    };
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
                        <textarea
                            className="settings-input-wide"
                            placeholder="Type your bio here..."
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                        />
                    )}
                </div>

                <div className="settings-section">
                    <h3>Country</h3>
                    <p>Select your country.</p>
                    <div className="settings-row">
                        <select
                        className="settings-input"
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        >
                        <option value="">Choose country</option>
                        {options.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                        </select>
                    </div>
                </div>

                <div className="settings-section">
                    <h3>Refresh Profile</h3>
                    <p>Reload your profile information.</p>
                    <button className="settings-btn settings-refresh" onClick={handleRefreshProfile}>
                        Refresh Profile
                    </button>
                    {refreshMsg && <h6 className="success">{refreshMsg}</h6>}
                </div>
                <Footer />
            </div>
        </>
    );
}

export default Settings;