import React, { useState, useEffect } from "react";
import { NavLink } from 'react-router-dom';
import logo from '../../assets/logo.png';
import './Header.css';

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if(!menuOpen) return;
        function handleClickOutside(event) {
            const menu = document.querySelector('.menu');
            const burger = document.querySelector('.burger-all');
            if (
            menu &&
            !menu.contains(event.target) &&
            burger &&
            !burger.contains(event.target)
            ) {
            setMenuOpen(false);
            }
        }
    
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]);

    return (
        <div className="header-all-container">
            <div className='header-all'>
                <div className='logo-on-left'>
                    <img src={logo} alt='Lunafy logo' />
                    <span className='name-dash'>Lunafy</span>
                </div>
                <div className="nav-center">
                    <NavLink to="/dashboard"  className="dashboard-link">Overview</NavLink>
                    <NavLink to="/Artists" className="dashboard-link">Artists</NavLink>
                    <NavLink to="/songs" className="dashboard-link">Songs</NavLink>
                    <NavLink to="/albums" className="dashboard-link">Albums</NavLink>
                    <NavLink to="/genres" className="dashboard-link">Genres</NavLink>
                    <NavLink to="/taste" className="dashboard-link">Discover your taste</NavLink>
                    <NavLink to="/roast" className="dashboard-link">roast</NavLink>
                </div>
                <div className='burger-menu-right'>
                    <div className='burger-all' onClick={() => setMenuOpen(!menuOpen)}>
                        <div className='bar-all'></div>
                        <div className='bar-all'></div>
                        <div className='bar-all'></div>
                    </div>
                    {menuOpen && (
                        <div className='menu'>
                            {window.innerWidth > 600 ? (
                                <>
                                    <a href="/profile">Profile</a>
                                    <a href='/settings'>Settings</a>
                                    <a href='/logout'>Logout</a>
                                </>
                            ) : (
                                <>
                                    <NavLink to="/dashboard">Overview</NavLink>
                                    <NavLink to="/Artists">Artists</NavLink>
                                    <NavLink to="/songs">Songs</NavLink>
                                    <NavLink to="/albums">Albums</NavLink>
                                    <NavLink to="/genres">Genres</NavLink>
                                    <NavLink to="/taste">Discover your taste</NavLink>
                                    <NavLink to="/roast">Roast</NavLink>
                                    <a href="/profile">Profile</a>
                                    <a href='/settings'>Settings</a>
                                    <a href='/logout'>Logout</a>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Header;