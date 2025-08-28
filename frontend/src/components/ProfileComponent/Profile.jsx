import React from 'react';
import './profile.css';
import Header from '../HeaderComponent';
import Footer from '../FooterComponent';
import { useState } from 'react';

function Profile() {
        const [showEmailInput, setShowEmailInput] = useState(false);
    const [showPasswordInput, setShowPasswordInput] = useState(false);

    return (
        <>
            <Header />
            <div className="profile-container">
                <h2 className="profile-title">Profile Settings</h2>

                <div className="profile-section">
                    <h3>Email</h3>
                    <div className="profile-row">
                        <span className="profile-label">your@email.com</span>
                        <button className="profile-btn" onClick={() => setShowEmailInput(!showEmailInput)}>
                            Change
                        </button>
                        <button className="profile-btn" style={{background: "#1db954"}}>Verify</button>
                    </div>
                    {showEmailInput && (
                        <div className="profile-row">
                            <input type="email" placeholder="Enter new email" className="profile-input" />
                            <button className="profile-btn">Save</button>
                        </div>
                    )}
                </div>

                <div className="profile-section">
                    <h3>Password</h3>
                    <div className="profile-row">
                        <span className="profile-label">********</span>
                        <button className="profile-btn" onClick={() => setShowPasswordInput(!showPasswordInput)}>
                            Change
                        </button>
                    </div>
                    {showPasswordInput && (
                        <div className="profile-row">
                            <input type="password" placeholder="Enter new password" className="profile-input" />
                            <button className="profile-btn">Save</button>
                        </div>
                    )}
                </div>

                <div className="profile-section">
                    <h3>Plan</h3>
                    <p className="profile-plan">Free</p>
                </div>

                <div className="profile-section">
                    <h3>Sign Out</h3>
                    <button className="profile-btn profile-signout">Sign Out</button>
                </div>

                <div className="profile-section">
                    <h3>Delete Account</h3>
                    <button className="profile-btn profile-delete">Delete Account</button>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default Profile;