import React, { useState } from 'react';
import '../DashboardComponent/dashboard.css';
import './user.css';
import Sidebar from '../SidebarComponent/Sidebar';

function Users() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // static sample rows (expanded for pagination demo)
  const rows = [
    { id: 1, name: 'Luna', email: 'luna@example.com', status: 'Active', verified: true, lastSeen: '2m ago', joined: '2024-07-21' },
    { id: 2, name: 'Mike', email: 'mike@example.com', status: 'Active', verified: false, lastSeen: '12m ago', joined: '2024-06-15' },
    { id: 3, name: 'Sara', email: 'sara@example.com', status: 'Deactivated', verified: true, lastSeen: '1d ago', joined: '2024-05-10' },
    { id: 4, name: 'Alex', email: 'alex@example.com', status: 'Active', verified: true, lastSeen: 'now', joined: '2024-08-01' },
    { id: 5, name: 'Noah', email: 'noah@example.com', status: 'Active', verified: false, lastSeen: '5m ago', joined: '2024-03-22' },
    { id: 6, name: 'Mina', email: 'mina@example.com', status: 'Active', verified: true, lastSeen: '29m ago', joined: '2024-04-18' },
    { id: 7, name: 'Eve', email: 'eve@example.com', status: 'Active', verified: true, lastSeen: '3h ago', joined: '2024-02-14' },
    { id: 8, name: 'Zed', email: 'zed@example.com', status: 'Active', verified: false, lastSeen: '9m ago', joined: '2024-01-30' },
    { id: 9, name: 'John', email: 'john@example.com', status: 'Active', verified: true, lastSeen: '15m ago', joined: '2024-01-15' },
    { id: 10, name: 'Emma', email: 'emma@example.com', status: 'Active', verified: false, lastSeen: '1h ago', joined: '2024-02-20' },
    { id: 11, name: 'David', email: 'david@example.com', status: 'Deactivated', verified: true, lastSeen: '2d ago', joined: '2024-03-05' },
    { id: 12, name: 'Sophie', email: 'sophie@example.com', status: 'Active', verified: true, lastSeen: '30m ago', joined: '2024-04-12' },
    { id: 13, name: 'Ryan', email: 'ryan@example.com', status: 'Active', verified: false, lastSeen: '45m ago', joined: '2024-05-18' },
    { id: 14, name: 'Lisa', email: 'lisa@example.com', status: 'Active', verified: true, lastSeen: '10m ago', joined: '2024-06-22' },
    { id: 15, name: 'Tom', email: 'tom@example.com', status: 'Active', verified: true, lastSeen: '5h ago', joined: '2024-07-10' },
    { id: 16, name: 'Amy', email: 'amy@example.com', status: 'Deactivated', verified: false, lastSeen: '3d ago', joined: '2024-08-15' },
    { id: 17, name: 'Chris', email: 'chris@example.com', status: 'Active', verified: true, lastSeen: '20m ago', joined: '2024-09-01' },
    { id: 18, name: 'Kate', email: 'kate@example.com', status: 'Active', verified: true, lastSeen: '1m ago', joined: '2024-09-15' },
    { id: 19, name: 'Mark', email: 'mark@example.com', status: 'Active', verified: false, lastSeen: '6h ago', joined: '2024-09-20' },
    { id: 20, name: 'Anna', email: 'anna@example.com', status: 'Active', verified: true, lastSeen: '2h ago', joined: '2024-09-24' }
  ];

  // Calculate pagination
  const totalUsers = rows.length;
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = rows.slice(indexOfFirstUser, indexOfLastUser);

  // Pagination handlers
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

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

        {/* Full-width table */}
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
                {currentUsers.map((u) => (
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
                        <button className="btn ghost" onClick={() => setSelectedUser(u)}>View</button>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, totalUsers)} of {totalUsers} users
              </div>
              
              <div className="pagination">
                <button 
                  className="pagination-btn" 
                  onClick={prevPage} 
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                
                {currentPage > 3 && (
                  <>
                    <button className="pagination-btn" onClick={() => paginate(1)}>1</button>
                    {currentPage > 4 && <span className="pagination-dots">...</span>}
                  </>
                )}
                
                {getPageNumbers().map(number => (
                  <button
                    key={number}
                    className={`pagination-btn ${currentPage === number ? 'active' : ''}`}
                    onClick={() => paginate(number)}
                  >
                    {number}
                  </button>
                ))}
                
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && <span className="pagination-dots">...</span>}
                    <button className="pagination-btn" onClick={() => paginate(totalPages)}>{totalPages}</button>
                  </>
                )}
                
                <button 
                  className="pagination-btn" 
                  onClick={nextPage} 
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal overlay for user details */}
        {selectedUser && (
          <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>User Details</h2>
                <button className="modal-close" onClick={() => setSelectedUser(null)}>×</button>
              </div>
              
              <div className="card user-details">
                <div className="details-header">
                  <div className="avatar xl">{selectedUser.name[0]}</div>
                  <div>
                    <div className="user-name xl">{selectedUser.name}</div>
                    <div className="muted">{selectedUser.email}</div>
                  </div>
                </div>

                <div className="details-grid">
                  <div>
                    <div className="muted">Status</div>
                    <div><span className={`badge ${selectedUser.status === 'Active' ? 'ok' : 'down'}`}>{selectedUser.status}</span></div>
                  </div>
                  <div>
                    <div className="muted">Email</div>
                    <div><span className={`badge ${selectedUser.verified ? 'ok' : 'warn'}`}>{selectedUser.verified ? 'Verified' : 'Unverified'}</span></div>
                  </div>
                  <div>
                    <div className="muted">Last seen</div>
                    <div>{selectedUser.lastSeen}</div>
                  </div>
                  <div>
                    <div className="muted">Joined</div>
                    <div>{selectedUser.joined}</div>
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
          </div>
        )}
      </main>
    </div>
  );
}

export default Users;