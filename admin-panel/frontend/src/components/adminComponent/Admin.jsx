import React, { useState } from 'react';
import './admin.css';
import Sidebar from '../SidebarComponent/Sidebar';

const staticAdmins = [
  {
    id: 1,
    name: 'Alice',
    email: 'alice@lunafy.com',
    created: '2024-01-10',
    lastLogin: '2024-09-25',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Bob',
    email: 'bob@lunafy.com',
    created: '2024-02-15',
    lastLogin: '2024-09-20',
    status: 'Inactive'
  }
];

function Admin() {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showLogsModal, setShowLogsModal] = useState(false);

  const filteredAdmins = staticAdmins.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Created', 'Last Login',];
    const rows = filteredAdmins.map(a => [
      a.id,
      `"${a.name}"`,
      `"${a.email}"`,
      a.created,
      a.lastLogin,
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admins.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className='dashboard-container'>
      <div className="sidebar-placeholder">
        <Sidebar />
      </div>
      <main className="dashboard-main">
        <h1 className="page-title">Admins</h1>
        <div className="user-toolbar">
          <input
            className="user-input"
            placeholder="Search name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="spacer" />
          <button className="btn" onClick={() => setShowAddModal(true)}>Add Admin</button>
          <button className="btn ghost" onClick={handleExportCSV}>Export CSV</button>
        </div>
        <div className="card">
          <div className="table-scroll">
            <table className="user-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Created</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <span className='user-name'>No admins found</span>
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map(a => (
                    <tr key={a.id}>
                      <td>{a.id}</td>
                      <td>{a.name}</td>
                      <td>{a.email}</td>
                      <td>{a.created}</td>
                      <td>{a.lastLogin}</td>
                      <td>
                        <div className="actions">
                          <button className="btn ghost" onClick={() => setSelectedAdmin(a)}>Details</button>
                          <button className="btn ghost" onClick={() => setShowLogsModal(true)}>Logs</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Admin Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add Admin</h2>
                <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              <form className="edit-profile-form">
                <div className="edit-profile-grid">
                  <div className="edit-field">
                    <label className="edit-label">Name</label>
                    <input className="edit-input" type="text" placeholder="Admin name" />
                  </div>
                  <div className="edit-field">
                    <label className="edit-label">Email</label>
                    <input className="edit-input" type="email" placeholder="Admin email" />
                  </div>
                  <div className="edit-field">
                    <label className="edit-label">Password</label>
                    <input className="edit-input" type="password" placeholder="Password" />
                  </div>
                </div>
                <div className="edit-actions">
                  <button className="btn" type="button" disabled>Add Admin</button>
                  <button className="btn ghost" type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Admin Details Modal */}
        {selectedAdmin && (
          <div className="modal-overlay" onClick={() => setSelectedAdmin(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Admin Details</h2>
                <button className="modal-close" onClick={() => setSelectedAdmin(null)}>×</button>
              </div>
              <div className="card user-details">
                <div className="details-header">
                  <div>
                    <div className="user-name xl">{selectedAdmin.name}</div>
                    <div className="muted">{selectedAdmin.email}</div>
                  </div>
                </div>
                <div className="details-grid">
                  <div>
                    <div className="muted">Created</div>
                    <div>{selectedAdmin.created}</div>
                  </div>
                  <div>
                    <div className="muted">Last Login</div>
                    <div>{selectedAdmin.lastLogin}</div>
                  </div>
                </div>
                <div className="details-actions">
                  <button className="btn" type="button" disabled>Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Logs Modal */}
        {showLogsModal && (
          <div className="modal-overlay" onClick={() => setShowLogsModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Admin Logs</h2>
                <button className="modal-close" onClick={() => setShowLogsModal(false)}>×</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Admin ID</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>2024-09-25 10:00</td>
                    <td>1</td>
                    <td>Logged in</td>
                  </tr>
                  <tr>
                    <td>2024-09-20 15:30</td>
                    <td>2</td>
                    <td>Changed password</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default Admin;