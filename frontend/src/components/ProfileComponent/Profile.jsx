import React, { useState ,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import './profile.css';
import Header from '../HeaderComponent';
import Footer from '../FooterComponent';

function Profile() {
    // const [showPasswordInput, setShowPasswordInput] = useState(false);
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

    const [infoData, setInfoData] = useState([]);
    useEffect(() => {
        fetch('http://127.0.0.1:5000/api/profile-info', {
            credentials: 'include',
        })
          .then(res => res.json())
          .then(data => {
            setInfoData(data.info);
            console.log(data.info);
          })
          .catch(err => console.error('Error fetching duration data:', err));
    }, [])

    const [deleteError, setDeleteError] = useState('');
    const handleDeleteAccount = () => {
        fetch('http://127.0.0.1:5000/api/csrf-token', { credentials: 'include' })
            .then(res => res.json())
            .then(tokenData => {
                fetch('http://127.0.0.1:5000/api/delete-account', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': tokenData.csrfToken
                        },
                })
                .then(res => res.json())
                .then(data => {
                    navigate('/');
                })
                .catch(e => {
                    setDeleteError('failed to delete account, try again later');
                    console.error('Error deleting account:', e);
                });
            })
    };

    const [verifyMsg, setVerifyMsg] = useState('');

    const handleVerifyEmail = () => {
         fetch('http://127.0.0.1:5000/api/csrf-token', { credentials: 'include' })
            .then(res => res.json())
            .then(tokenData => {
                fetch('http://127.0.0.1:5000/api/send-verification-email', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': tokenData.csrfToken
                    },
                })
                .then(res => res.json())
                .then(data => {
                    setVerifyMsg(data.message || 'Verification email sent! Please check your inbox.');
                })
                .catch(e => {
                    setVerifyMsg('Failed to send verification email. Try again later.');
                    console.error('Error sending verification email:', e);
                });
            })
        
    };

    return (
        <>
            <Header />
            <div className="profile-container">
                <h2 className="profile-title">Profile Settings</h2>

                <div className="profile-section">
                    <h3>Email</h3>
                    <p>Verify your email address and keep your account safe</p>
                    <div className="profile-row">
                        <span className="profile-label">{infoData[0]?.email}</span>
                        {infoData[0]?.verified
                            ? <span className="profile-label verified-label">
                                <FontAwesomeIcon icon={faCheckCircle} style={{color: "#1db954", marginRight: "6px"}} />
                                Verified
                            </span>
                            : <button className="profile-btn" style={{background: "#1db954"}} onClick={handleVerifyEmail}>Verify</button>
                        }
                    </div>
                    {verifyMsg && <h6 className='success'>{verifyMsg}</h6>}
                </div>

                <div className="profile-section">
                    <h3>Plan</h3>
                    <p>Free plan: Enjoy all available features. Premium upgrades coming soon!</p>
                    <p className="profile-plan">Free</p>
                </div>

                <div className="profile-section">
                    <h3>Sign Out</h3>
                    <p>Sign out from you account on all devices</p>
                    <a href='/logout' className="profile-btn profile-signout">Sign Out</a>
                </div>

                <div className="profile-section">
                    <h3>Delete Account</h3>
                    <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
                    <button className="profile-btn profile-delete" onClick={handleDeleteAccount}>Delete Account</button>
                    <h6 className='error'>{deleteError}</h6>
                </div>
                <Footer />
            </div>
            
        </>
    )
}

export default Profile;