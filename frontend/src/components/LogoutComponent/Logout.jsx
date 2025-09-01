import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleLogout = async() => {
            try {
                const tokenRes = await fetch('http://127.0.0.1:5000/api/csrf-token', { credentials: 'include' });
                const tokenData = await tokenRes.json();
                const response = await fetch('http://127.0.0.1:5000/api/logout', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': tokenData.csrfToken
                    },
                });

                if (response.ok) {
                    navigate('/')
                }
                else {
                    console.error('Logout failed');
                    navigate('/');
                }
            } catch(e) {
                console.error('Error during logout:', e);
                navigate('/')
            }
        };

        handleLogout();
    }, [navigate]);

    return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#191414',
      color: 'white'
    }}>
      <h2>Logging out...</h2>
    </div>
  );
}

export default Logout;