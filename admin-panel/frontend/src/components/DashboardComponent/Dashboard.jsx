import React from 'react';
import './dashboard.css';
import Sidebar from '../SidebarComponent/Sidebar';

function Dashboard() {
    

    return (
        <div className='dashboard-container'>
            <div className='sidebar-placeholder'>
                <Sidebar />
            </div>
            
            <main className='dashboard-main'>
                <h1 className='page-title'>General Overview</h1>

                <section className='kpi-grid'>
                <div className='kpi-card'>
                    <div className='kpi-title'>User Count</div>
                    <div className='kpi-value'>12,345</div>
                    <div className='kpi-sub'>+1.8% vs last week</div>
                </div>
                <div className='kpi-card'>
                    <div className='kpi-title'>Active Users (24h)</div>
                    <div className='kpi-value'>1,204</div>
                    <div className='kpi-sub'>34 online now</div>
                </div>
                <div className='kpi-card'>
                    <div className='kpi-title'>Errors (24h)</div>
                    <div className='kpi-value warn'>27</div>
                    <div className='kpi-sub'>Most: 500 Internal</div>
                </div>
                </section>

                <section className='two-col'>
                <div className='card'>
                    <h2 className='section-title'>Recent Activity</h2>
                    <ul className='activity-list'>
                    <li className='activity-item'>
                        <span className='activity-time'>12:41</span>
                        <span className='activity-text'><strong>@luna</strong> signed up</span>
                    </li>
                    <li className='activity-item'>
                        <span className='activity-time'>12:16</span>
                        <span className='activity-text'>Verified email for <strong>@mike</strong></span>
                    </li>
                    <li className='activity-item'>
                        <span className='activity-time'>11:50</span>
                        <span className='activity-text'>Deactivated <strong>@spammer123</strong></span>
                    </li>
                    <li className='activity-item'>
                        <span className='activity-time'>11:10</span>
                        <span className='activity-text'>Password reset sent to <strong>@sara</strong></span>
                    </li>
                    <li className='activity-item'>
                        <span className='activity-time'>10:45</span>
                        <span className='activity-text'>Login failed (rate limited)</span>
                    </li>
                    </ul>
                </div>

                <div className='card'>
                    <h2 className='section-title'>System Health</h2>
                    <div className='status-grid'>
                    <div className='status-card'>
                        <div className='status-label'>DB Status</div>
                        <div className='status-pill ok'>Operational</div>
                        <div className='status-meta'>Latency 12 ms</div>
                    </div>
                    <div className='status-card'>
                        <div className='status-label'>Queue</div>
                        <div className='status-pill warn'>Backlog</div>
                        <div className='status-meta'>57 jobs pending</div>
                    </div>
                    <div className='status-card'>
                        <div className='status-label'>API Latency</div>
                        <div className='status-pill ok'>120 ms p95</div>
                        <div className='status-meta'>+8 ms today</div>
                    </div>
                    </div>
                </div>
                </section>
            </main>
        </div>
    );
}
export default Dashboard;