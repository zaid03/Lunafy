import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './SpotifyCallback.css';

function SpotifyCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

  const code = searchParams.get('code');
  if (code) {


    fetch('http://127.0.0.1:5000/api/auth/spotify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ code }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          navigate('/dashboard');
        } 
        else {
          console.log(data.error || "Spotify authentication failed.");
          navigate('/');
        }
      })
        .catch(err => {
         console.error("Error sending code to backend:", err);
         alert("Error");
         navigate('/');
        });
  } else {
    console.error("No authorization code found.");
    navigate('/');
  }
}, [navigate, searchParams]);

    return (
    <div style={{ textAlign: 'center', marginTop: '60px' }}>
      <div className="spotify-spinner"></div>
      <p style={{ color: '#1DB954', fontWeight: 'bold', marginTop: '20px' }}>
        Authenticating with Spotify...
      </p>
    </div>
  );
}

export default SpotifyCallback;