import React, { useState, useEffect } from 'react';
import './login.css';
import { useNavigate } from 'react-router-dom';

function Login () {

    const navigate = useNavigate();
    useEffect(() => {
        fetch('http://127.0.0.1:5000/api/test-session-admin', {
            credentials: 'include',
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            if (data.adminId) {
                navigate('/dashboard');
            }
            })
        .catch(() => {
            
            navigate('/');
        });
    }, [navigate]);

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const tokenRes = await fetch('http://127.0.0.1:5000/api/csrf-token', { credentials: 'include' });
            const tokenData = await tokenRes.json();

            const res = await fetch('http://127.0.0.1:5000/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': tokenData.csrfToken
                },
                credentials: 'include',
                body: JSON.stringify({ name, password })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('Login successful!');
                navigate('/dashboard');
            } else {
                setMessage(data.message || 'Login failed');
            }
        } catch (err) {
            setMessage('Server error');
        }
    };

    return(
        <div className='main-container'>
            <div className='content-container'>
                <div className='form-container'>
                    <form onSubmit={handleSubmit}>
                        <h2 className="login-title">Welcome Back</h2>
                        <label htmlFor="name" className="login-label">Name</label>
                        <input 
                            type='text' 
                            id='name' 
                            className="login-input" 
                            placeholder='Enter your name' 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                        <label htmlFor="password" className="login-label">Password</label>
                        <input 
                            type='password' 
                            id='password' 
                            className="login-input" 
                            placeholder='Enter your password' 
                            value={password}
                            onChange={e => setPassword(e.target.value)}required/>
                        <button 
                            className="login-btn" 
                            type="submit" 
                        >
                            Sign In
                        </button>
                        {message && <div style={{marginTop: 16, color: 'red', textAlign: 'center'}}>{message}</div>}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;