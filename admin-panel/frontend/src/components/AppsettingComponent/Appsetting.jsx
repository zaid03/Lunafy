import React from 'react';
import './appsetting.css';
import Sidebar from '../SidebarComponent/Sidebar';

function Appsetting() {
    return (
        <div className='dashboard-container'>
            <div className="sidebar-placeholder">
                <Sidebar />
            </div>
        </div>
    )
}

export default Appsetting;