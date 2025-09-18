import React from 'react';
import './user.css';
import Sidebar from '../SidebarComponent/Sidebar';

function Users() {
  // static sample rows
  const rows = [
    { id: 1, name: 'Luna', email: 'luna@example.com', status: 'Active', verified: true, lastSeen: '2m ago' },
    { id: 2, name: 'Mike', email: 'mike@example.com', status: 'Active', verified: false, lastSeen: '12m ago' },
    { id: 3, name: 'Sara', email: 'sara@example.com', status: 'Deactivated', verified: true, lastSeen: '1d ago' },
    { id: 4, name: 'Alex', email: 'alex@example.com', status: 'Active', verified: true, lastSeen: 'now' },
    { id: 5, name: 'Noah', email: 'noah@example.com', status: 'Active', verified: false, lastSeen: '5m ago' },
    { id: 6, name: 'Mina', email: 'mina@example.com', status: 'Active', verified: true, lastSeen: '29m ago' },
    { id: 7, name: 'Eve', email: 'eve@example.com', status: 'Active', verified: true, lastSeen: '3h ago' },
    { id: 8, name: 'Zed', email: 'zed@example.com', status: 'Active', verified: false, lastSeen: '9m ago' }
  ];

  return (
    <div className="dashboard-container">
      <div className="sidebar-placeholder">
        <Sidebar />
      </div>

      <main className="dashboard-main">
        <h1 className="page-title">Users</h1>

        {/* Toolbar */}
        <div className="user-toolbar">
          <input className="user-input" placeholder="Search name or email..." />
          <select className="user-select">
            <option value="">All statuses</option>
            <option>Active</option>
            <option>Deactivated</option>
          </select>
          <select className="user-select">
            <option value="">Email: any</option>
            <option>Verified</option>
            <option>Unverified</option>
          </select>
          <div className="spacer" />
          <button className="btn ghost">Export CSV</button>
        </div>

        <div className="two-col">
          {/* List */}
          <div className="card">
            <div className="table-scroll">
              <table className="user-table">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}><input type="checkbox" /></th>
                    <th>User</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Verified</th>
                    <th>Last seen</th>
                    <th style={{ width: 260 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((u) => (
                    <tr key={u.id}>
                      <td><input type="checkbox" /></td>
                      <td>
                        <div className="user-cell">
                          <div className="avatar">{u.name[0]}</div>
                          <div>
                            <div className="user-name">{u.name}</div>
                            <div className="user-id">ID #{String(u.id).padStart(4, '0')}</div>
                          </div>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.status === 'Active' ? 'ok' : 'down'}`}>{u.status}</span>
                      </td>
                      <td>
                        <span className={`badge ${u.verified ? 'ok' : 'warn'}`}>{u.verified ? 'Verified' : 'Unverified'}</span>
                      </td>
                      <td>{u.lastSeen}</td>
                      <td>
                        <div className="actions">
                          <button className="btn ghost">View</button>
                          <button className="btn">Edit</button>
                          <button className="btn warn">{u.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
                          <button className="btn ghost">Logs</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Details panel (static preview) */}
          <div className="card user-details">
            <div className="details-header">
              <div className="avatar xl">L</div>
              <div>
                <div className="user-name xl">Luna</div>
                <div className="muted">luna@example.com</div>
              </div>
            </div>

            <div className="details-grid">
              <div>
                <div className="muted">Status</div>
                <div><span className="badge ok">Active</span></div>
              </div>
              <div>
                <div className="muted">Email</div>
                <div><span className="badge ok">Verified</span></div>
              </div>
              <div>
                <div className="muted">Last seen</div>
                <div>2m ago</div>
              </div>
              <div>
                <div className="muted">Joined</div>
                <div>2024-07-21</div>
              </div>
            </div>

            <div className="details-actions">
              <button className="btn">Edit Profile</button>
              <button className="btn warn">Deactivate</button>
              <button className="btn ghost">Verify Email</button>
              <button className="btn ghost">Download Logs</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Users;