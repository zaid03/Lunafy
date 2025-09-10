import React from 'react';
import '../PrivacyComponent/privacy.css';
import Header from '../HeaderComponent';
import Footer from '../FooterComponent';
function Terms() {
    return(
        <>
            <div style={{ background: "var(--primary-bg)", width: "100%" }}>
            <Header />
                <div className="privacy-content">
                    <h1>Terms Of Service</h1>
                    <p>
                        By using Lunafy, you agree to use the service for personal, non-commercial purposes only. We do not guarantee uninterrupted access or accuracy of the data provided. Lunafy is not affiliated with Spotify. Misuse of the platform may result in restricted access. For questions, contact terguyzaid@gmail.com.
                    </p>
                </div>
                <Footer />
            </div>
        </>
    );
}

export default Terms;