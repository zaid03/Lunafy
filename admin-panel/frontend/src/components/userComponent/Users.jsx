import React, { useEffect, useState } from 'react';
import './user.css';
import Sidebar from '../SidebarComponent/Sidebar';

function Users() {

  const [User, setUser] = useState(null);
  useEffect(() => {
    fetch(`http://127.0.0.1:5000/admin/users`,
      {credentials: 'include'}
    )
    .then(res => res.json())
    .then(data => setUser(data))
    .catch(() => {})
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');

  const filteredUsers = User && User.users ? User.users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());

    const isActive = (new Date() - new Date(u.last_seen)) < 24 * 60 * 60 * 1000;
    const matchesStatus =
      statusFilter === '' ||
      (statusFilter === 'Active' && isActive) ||
      (statusFilter === 'Deactivated' && !isActive);

    const matchesEmail =
      emailFilter === '' ||
      (emailFilter === 'Verified' && u.verified) ||
      (emailFilter === 'Unverified' && !u.verified);

    return matchesSearch && matchesStatus && matchesEmail;
  }) : []

  // Calculate pagination
  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

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

  const [log, setLog] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const handleClick = (user) => {
    setSelectedLog(user);
    fetch(`http://127.0.0.1:5000/admin/logs?name=${user.name}`,
      {credentials: 'include'}
    )
    .then(res => res.json())
    .then(data => setLog(data.logs))
    .catch(() => {})
  }

  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const handleView = (user) => {
    setSelectedUser(user);
    fetch(`http://127.0.0.1:5000/admin/details?name=${user.name}`,
      {credentials: 'include'}
    )
    .then(res => res.json())
    .then(data => setUserDetails(data.deletion))
    .catch(() => {})
  }
  
  const handleActivation = () => {
    if (!selectedUser || !userDetails) return;
    const newDeletion = userDetails.deletion === 1 ? 0 : 1;
    fetch(`http://127.0.0.1:5000/admin/activation`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({ id: selectedUser.id, deletion: newDeletion })
    })
    .then(res => res.json())
    .then(data => {
      setUserDetails({ ...userDetails, deletion: newDeletion });
    })
    .catch(() => {});
  }

  const handleExportCSV = () => {
    if (!User || !User.users || User.users.length === 0) return;

    const headers = ['ID', 'Name', 'Email', 'Status', 'Verified', 'Last seen', 'Joined'];
    const rows = User.users.map(u => [
      u.id,
      `"${u.name}"`,
      `"${u.email}"`,
      (new Date() - new Date(u.last_seen)) < 24 * 60 * 60 * 1000 ? 'Active' : 'Inactive',
      u.verified ? 'Verified' : 'Unverified',
      new Date(u.last_seen).toLocaleDateString(),
      new Date(u.joined).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const [csrfToken, setCsrfToken] = useState('');
  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/csrf-token', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrfToken))
      .catch(() => {});
  }, []);

  return (
    <div className="dashboard-container">
      <div className="sidebar-placeholder">
        <Sidebar />
      </div>

      <main className="dashboard-main">
        <h1 className="page-title">Users</h1>

        {/* Toolbar */}
        <div className="user-toolbar">
          <input 
            className="user-input" 
            placeholder="Search name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)} 
          />
          <select 
            className="user-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option>Active</option>
            <option>Deactivated</option>
          </select>

          <select 
            className="user-select"
            value={emailFilter}
            onChange={e => setEmailFilter(e.target.value)}
          >
            <option value="">Email: any</option>
            <option>Verified</option>
            <option>Unverified</option>
          </select>
          <div className="spacer" />
          <button className="btn ghost" onClick={handleExportCSV}>Export CSV</button>
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
                  <th>Joined</th>
                  <th style={{ width: 20 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <span className='user-name'>No users yet</span>
                    </td>
                  </tr>
                ):(
                  currentUsers.map((u) => (
                    <tr key={u.id}>
                      <td><input type="checkbox" /></td>
                      <td>
                        <div className="user-cell">
                          <div className="avatar"><img src={u.profile_image} alt='pfp'/></div>
                          <div>
                            <div className="user-name">{u.name}</div>
                            <div className="user-id">ID #{String(u.id).padStart(4, '0')}</div>
                          </div>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${(new Date() - new Date(u.last_seen)) < 24 * 60 * 60 * 1000 ? 'ok' : 'down'}`}>
                          {(new Date() - new Date(u.last_seen)) < 24 * 60 * 60 * 1000 ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.verified ? 'ok' : 'warn'}`}>{u.verified ? 'Verified' : 'Unverified'}</span>
                      </td>
                      <td>{(new Date(u.last_seen)).toLocaleDateString()}</td>
                      <td>{(new Date(u.joined)).toLocaleDateString()}</td>
                      <td>
                        <div className="actions">
                          <button className="btn ghost" onClick={() => handleView(u)}>View</button>
                          <button className="btn ghost" onClick={() => {handleClick(u)}}>Logs</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
                  <div className="avatar xl"><img src={selectedUser.profile_image} alt='pfp'/></div>
                  <div>
                    <div className="user-name xl">{selectedUser.name}</div>
                    <div className="muted">{selectedUser.email}</div>
                  </div>
                </div>

                <div className="details-grid">
                  <div>
                    <div className="muted">Status</div>
                    <div><span className={`badge ${(new Date() - new Date(selectedUser.last_seen)) < 24 * 60 * 60 * 1000 ? 'ok' : 'down'}`}>{(new Date() - new Date(selectedUser.last_seen)) < 24 * 60 * 60 * 1000 ? 'Active' : 'Inactive'}</span></div>
                  </div>
                  <div>
                    <div className="muted">Email</div>
                    <div><span className={`badge ${selectedUser.verified ? 'ok' : 'warn'}`}>{selectedUser.verified ? 'Verified' : 'Unverified'}</span></div>
                  </div>
                  <div>
                    <div className="muted">Last seen</div>
                    <div>{(new Date(selectedUser.last_seen)).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="muted">Joined</div>
                    <div>{new Date(selectedUser.joined).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="details-actions">
                  <button className="btn warn" onClick={handleActivation}>
                    {userDetails && userDetails.deletion !== undefined && userDetails.deletion !== null
                    ? userDetails.deletion === 0
                      ? 'Deactivate account'
                      : userDetails.deletion === 1
                        ? 'Activate account'
                        : 'Unknown'
                    : 'Unknown'}
                  </button>
                  {/* <button className="btn ghost">Verify Email</button>
                  <button className="btn ghost">Download Logs</button> */}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal overlay for user's logs*/}
        {selectedLog && (
          <div className="modal-overlay" onClick={() => {setSelectedLog(null); setLog(null)}}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>User Logs</h2>
                <button className="modal-close" onClick={() => {setSelectedLog(null); setLog(null)}}>×</button>
              </div>
              <table>
                <thead>
                  <th>Date</th>
                  <th>User id</th>
                  <th>Action</th>
                  <th>Action Id</th>
                </thead>
                <tbody>
                  {log && log.length > 0 ? (
                    log.map((entry, idx) => (
                      <tr key={idx}>
                        <td>{new Date(entry.created_at).toLocaleString()}</td> 
                        <td>{entry.actor_id}</td>
                        <td>{entry.action}</td>
                        <td>{entry.actor_type}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>No logs found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Users;