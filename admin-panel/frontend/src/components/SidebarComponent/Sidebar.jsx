import React from 'react';
import './sidebar.css';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/logo.png';

function Sidebar() {
    return (
        <div className='sidebar-container'>
            <div className='logo'>
                <img src={logo} alt='Lunafy logo' />
                <h1>Lunafy Admin</h1>      
            </div>
            <div className='navigation-btns'>
                <NavLink to={'/dashboard'}>General</NavLink>
                <NavLink to={'/users'}>Users</NavLink>
                <NavLink to={'/admins'}>Admins</NavLink>
                <NavLink to={'/support'}>Support</NavLink>
                <NavLink to={'/logout '}>Log out </NavLink>
            </div>
        </div>
    );
}

export default Sidebar;