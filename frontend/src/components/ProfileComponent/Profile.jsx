import React, { useState ,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './profile.css';
import Header from '../HeaderComponent';
import Footer from '../FooterComponent';

function Profile() {
    const [showPasswordInput, setShowPasswordInput] = useState(false);
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

    return (
        <>
            <Header />
            <div className="profile-container">
                <h2 className="profile-title">Profile Settings</h2>

                <div className="profile-section">
                    <h3>Email</h3>
                    <p>Verify you email address and keep your account safe</p>
                    <div className="profile-row">
                        <span className="profile-label">terguyzaid@gmail.com</span>
                        <button className="profile-btn" style={{background: "#1db954"}}>Verify</button>
                    </div>
                </div>

                <div className="profile-section">
                    <h3>Password</h3>
                    <p>Update you password to protect your account and personal information</p>
                    <div className="profile-row">
                        <button className="profile-btn" onClick={() => setShowPasswordInput(!showPasswordInput)}>
                            Change
                        </button>
                    </div>
                    {showPasswordInput && (
                        <div className="profile-row-password">
                            <input type="password" placeholder="Enter existing password" className="profile-input" />
                            <input type="password" placeholder="Enter new password" className="profile-input" />
                            <input type="password" placeholder="Confirm new password" className="profile-input" />
                            <button className="profile-btn">Save</button>
                        </div>
                    )}
                </div>

                <div className="profile-section">
                    <h3>Plan</h3>
                    <p>Free plan: Enjoy all available features. Premium upgrades coming soon!</p>
                    <p className="profile-plan">Free</p>
                </div>

                <div className="profile-section">
                    <h3>Sign Out</h3>
                    <p>Sign out from you account on all devices</p>
                    <button className="profile-btn profile-signout">Sign Out</button>
                </div>

                <div className="profile-section">
                    <h3>Delete Account</h3>
                    <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
                    <button className="profile-btn profile-delete">Delete Account</button>
                </div>
                <Footer />
            </div>
            
        </>
    )
}

export default Profile;