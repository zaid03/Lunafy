import React from 'react';
import './privacy.css';
import Header from '../HeaderComponent';
import Footer from '../FooterComponent';

function Privacy() {
    return(
        <>
        
        <div style={{ background: "var(--primary-bg)", width: "100%" }}>
            <Header />
            <div className="privacy-content">
                <h1>Privacy Policy</h1>
                <p>
                    Your privacy is important to us. Lunafy does not store your Spotify login credentials. We only access your listening data with your permission to provide personalized insights. We do not share your personal information with third parties. For questions, contact us at terguyzaid@gmail.com.
                </p>
            </div>
            <Footer />
        </div>
        </>
    );
}

export default Privacy;