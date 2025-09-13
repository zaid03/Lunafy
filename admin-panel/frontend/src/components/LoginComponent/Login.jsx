import React, { useState } from 'react';
import './login.css';

function Login () {

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            console.log('here 1');
            const tokenRes = await fetch('http://localhost:5000/api/csrf-token', { credentials: 'include' });
            const tokenData = await tokenRes.json();

            console.log('here 2');
            const res = await fetch('http://localhost:5000/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': tokenData.csrfToken
                },
                credentials: 'include',
                body: JSON.stringify({ name, password })
            });
            console.log('here 13');
            const data = await res.json();
            console.log('here 14');
            console.log(data);
            if (res.ok) {
                setMessage('Login successful!');
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
                        {message && <div style={{marginTop: 16, color: '#eebbc3', textAlign: 'center'}}>{message}</div>}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;