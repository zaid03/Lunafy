import React, { useEffect, useState } from 'react';
import './dashboard.css';
import Sidebar from '../SidebarComponent/Sidebar';

function Dashboard() {

    const [info, setInfo] = useState({
        users: { total: 0, active24h: 0, onlineNow: 0 },
        errors24hTop: null,
        activity: []
    });

    useEffect(() => {
        fetch(`http://127.0.0.1:5000/admin/general`,
            {credentials: 'include'}
        )
        .then(res => res.json())
        .then(data => setInfo(data))
        .catch(() => {});
    }, []);

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
                    <div className='kpi-value'>{info.users.total.toLocaleString()}</div>
                    {/* <div className='kpi-sub'>+1.8% vs last week</div> */}
                </div>
                <div className='kpi-card'>
                    <div className='kpi-title'>Active Users (24h)</div>
                    <div className='kpi-value'>{info.users.active24h.toLocaleString()}</div>
                    <div className='kpi-sub'>{info.users.onlineNow} online now</div>
                </div>
                <div className='kpi-card'>
                    <div className='kpi-title'>Errors (24h)</div>
                    <div className='kpi-value warn'>{info.errors24hTop ? info.errors24hTop.count : 0}</div>
                    <div className='kpi-sub'>Most: {info.errors24hTop ? info.errors24hTop.status: '_'}</div>
                </div>
                </section>

                <section className='two-col'>
                <div className='card'>
                    <h2 className='section-title'>Recent Activity</h2>
                    <ul className='activity-list'>
                        {info.activity.length === 0 ? (
                            <li className='activity-item'>
                                <span className='activity-text'>No recent activity</span>
                            </li>
                        ): (
                            info.activity.map((a, i) => (
                                <li key={i} className='activity-item'>
                                    <span className='activity-time'>
                                    {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className='activity-text'>{a.message}</span>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                {/* <div className='card'>
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
                </div> */}
                </section>
            </main>
        </div>
    );
}
export default Dashboard;