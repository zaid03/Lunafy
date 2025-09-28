import React, { useState, useEffect } from 'react';
import Sidebar from '../SidebarComponent/Sidebar';

function Admin() {
    const [admins, setAdmins] = useState([]);
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetch('http://127.0.0.1:5000/admin/admins', { credentials: 'include' })
        .then(res => res.json())
        .then(data => setAdmins(Array.isArray(data.admins) ? data.admins : []))
        .catch(() => setAdmins([]));
    }, []);

    const filteredAdmins = admins.filter(a =>
        (a.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.email || '').toLowerCase().includes(search.toLowerCase())
    );

    const [currentPage, setCurrentPage] = useState(1);
    const adminsPerPage = 10;

    const totalAdmins = filteredAdmins.length;
    const totalPages = Math.ceil(totalAdmins / adminsPerPage);
    const indexOfLastAdmin = currentPage * adminsPerPage;
    const indexOfFirstAdmin = indexOfLastAdmin - adminsPerPage;
    const currentAdmins = filteredAdmins.slice(indexOfFirstAdmin, indexOfLastAdmin);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

    const getPageNumbers = () => {
        const pageNumbers = [];
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        return pageNumbers;
    };

    const [log, setLog] = useState(null);
    const [showLogsModal, setShowLogsModal] = useState(false);
    const handleClick = (a) => {
        setShowLogsModal(true);
        fetch(`http://127.0.0.1:5000/admin/logs-admin?id=${a.id}&name=${a.name}`,
            {credentials: 'include'}
        )
        .then(res => res.json())
        .then(data => setLog(data.logs))
        .catch(() => {})
    }

    const [csrfToken, setCsrfToken] = useState('');
    useEffect(() => {
    fetch('http://127.0.0.1:5000/api/csrf-token', { credentials: 'include' })
        .then(res => res.json())
        .then(data => setCsrfToken(data.csrfToken))
        .catch(() => {});
    }, []);

    const handleDeletion = (id) => {
        if (!currentAdmins) return;
        fetch(`http://127.0.0.1:5000/admin/deleted?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
        },
        })
        .then(res => res.json())
        .then(data => {
            setAdmins(admins.filter(a => a.id !== id));
        })
        .catch(() => {});
    }

    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
    const handleAdding = () => {
        fetch('http://127.0.0.1:5000/admin/admin-add', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify(newAdmin)
        })
            .then(res => res.json())
            .then(data => {
                setShowAddModal(false);
                setNewAdmin({ name: '', email: '', password: '' });
            })
            .catch(() => {});
    }

    // CSV Export
    const handleExportCSV = () => {
        const headers = ['ID', 'Name', 'Email', 'Last Seen', 'Last Login',];
        const rows = filteredAdmins.map(a => [
        a.id,
        `"${a.name}"`,
        `"${a.email}"`,
        a.last_seen,
        a.last_login,
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
                    currentAdmins.map(a => (
                        <tr key={a.id}>
                        <td>{a.id}</td>
                        <td>{a.name}</td>
                        <td>{a.email}</td>
                        <td>{(new Date(a.last_seen).toLocaleDateString())}</td>
                        <td>{(new Date(a.last_login).toLocaleTimeString())}</td>
                        <td>
                            <div className="actions">
                            <button className="btn ghost" onClick={() => handleClick(a)}>Logs</button>
                            <button className="btn ghost" onClick={() => handleDeletion(a.id)}>Delete</button>
                            </div>
                        </td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
                    {totalPages > 1 && (
                        <div className="pagination-container">
                            <div className="pagination-info">
                            Showing {indexOfFirstAdmin + 1}-{Math.min(indexOfLastAdmin, totalAdmins)} of {totalAdmins} admins
                            </div>
                            <div className="pagination">
                            <button
                                className="pagination-btn"
                                onClick={prevPage}
                                disabled={currentPage === 1}
                            >
                                ← Previous
                            </button>
                            {getPageNumbers().map(number => (
                                <button
                                key={number}
                                className={`pagination-btn ${currentPage === number ? 'active' : ''}`}
                                onClick={() => paginate(number)}
                                >
                                {number}
                                </button>
                            ))}
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
                        <input 
                            className="edit-input" 
                            type="text" 
                            placeholder="Admin name" 
                            value={newAdmin.name}
                            onChange={e => setNewAdmin({...newAdmin, name: e.target.value})}    
                        />
                    </div>
                    <div className="edit-field">
                        <label className="edit-label">Email</label>
                        <input 
                            className="edit-input" 
                            type="email" 
                            placeholder="Admin email" 
                            value={newAdmin.email}
                            onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        />
                    </div>
                    <div className="edit-field">
                        <label className="edit-label">Password</label>
                        <input 
                            className="edit-input" 
                            type="password" 
                            placeholder="Password" 
                            value={newAdmin.password}
                            onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                        />
                    </div>
                    </div>
                    <div className="edit-actions">
                    <button className="btn" type="button" onClick={handleAdding}>Add Admin</button>
                    <button className="btn ghost" type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
                    </div>
                </form>
                </div>
            </div>
            )}

            {/* Admin Logs Modal */}
            {showLogsModal && (
            <div className="modal-overlay" onClick={() => {setShowLogsModal(false); setLog(null)}}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Admin Logs</h2>
                    <button className="modal-close" onClick={() => {setShowLogsModal(false); setLog(null)}}>×</button>
                </div>
                <table>
                    <thead>
                    <tr>
                        <th>Date</th>
                        <th>User id</th>
                        <th>Action</th>
                        <th>Action Id</th>
                    </tr>
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

export default Admin;