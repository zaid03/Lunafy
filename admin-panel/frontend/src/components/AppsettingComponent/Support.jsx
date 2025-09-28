import React, { useEffect, useState } from 'react';
import './support.css';
import Sidebar from '../SidebarComponent/Sidebar';

function Support() {
    const [activeTab, setActiveTab] = useState('contact');
    const [selectedMsg, setSelectedMsg] = useState(null);
    const [reply, setReply] = useState('');

    const [contactRequests, setContactRequests] = useState([]);
    const [userSupports, setUserSupports] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        if(activeTab === 'contact') {
            fetch('http://127.0.0.1:5000/admin/contact-msg', { credentials: 'include' })
                .then(res => res.json())
                .then(data => setContactRequests(Array.isArray(data.messages) ? data.messages : []))
                .finally(() => setLoading(false));
        } else {
            fetch('http://127.0.0.1:5000/admin/support-msg', { credentials: 'include' })
                .then(res => res.json())
                .then(data => setUserSupports(Array.isArray(data.usermessages) ? data.usermessages : []))
                .finally(() => setLoading(false));
        }
    }, [activeTab]);

    const messages = activeTab === 'contact' ? contactRequests : userSupports;

    const [currentPage, setCurrentPage] = useState(1);
    const messagesPerPage = 10;

    const totalMessages = messages.length;
    const totalPages = Math.ceil(totalMessages / messagesPerPage);
    const indexOfLastMsg = currentPage * messagesPerPage;
    const indexOfFirstMsg = indexOfLastMsg - messagesPerPage;
    const currentMessages = messages.slice(indexOfFirstMsg, indexOfLastMsg);

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

    React.useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, messages.length]);

    return (
        <div className='dashboard-container'>
            <div className="sidebar-placeholder">
                <Sidebar />
            </div>
            <main className="dashboard-main">
                <h1 className="page-title">Support</h1>
                <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                    <button
                        className={`btn ghost${activeTab === 'contact' ? ' active' : ''}`}
                        onClick={() => setActiveTab('contact')}
                    >
                        Contact Requests
                    </button>
                    <button
                        className={`btn ghost${activeTab === 'user' ? ' active' : ''}`}
                        onClick={() => setActiveTab('user')}
                    >
                        User Support
                    </button>
                </div>
                <div className="card">
                    <div className="table-scroll">
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>{activeTab === 'contact' ? 'Name' : 'User'}</th>
                                    <th>Email</th>
                                    <th>Message</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4}>Loading...</td>
                                    </tr>
                                ): currentMessages.length === 0 ? (
                                    <tr>
                                        <td colSpan={4}>No messages found</td>
                                    </tr>
                                ) : (
                                    currentMessages.map(msg => (
                                        <tr key={msg.id} style={{ cursor: 'pointer' }} onClick={() => { setSelectedMsg(msg); setReply(''); }}>
                                            <td>{activeTab === 'contact' ? msg.name : msg.user}</td>
                                            <td>{msg.email}</td>
                                            <td>
                                                {msg.message.length > 40
                                                    ? msg.message.slice(0, 40) + '...'
                                                    : msg.message}
                                            </td>
                                            <td>{(new Date(msg.created_at).toLocaleDateString())}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        {totalPages > 1 && (
                            <div className="pagination-container">
                                <div className="pagination-info">
                                Showing {indexOfFirstMsg + 1}-{Math.min(indexOfLastMsg, totalMessages)} of {totalMessages} messages
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

                {/* Modal for viewing and replying to a message */}
                {selectedMsg && (
                    <div className="modal-overlay" onClick={() => setSelectedMsg(null)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Message Details</h2>
                                <button className="modal-close" onClick={() => setSelectedMsg(null)}>×</button>
                            </div>
                            <div className="card user-details" style={{ marginBottom: 16 }}>
                                <div style={{ marginBottom: 8 }}>
                                    <strong>{activeTab === 'contact' ? 'From' : 'User'}:</strong> {activeTab === 'contact' ? selectedMsg.name : selectedMsg.user}
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                    <strong>Email:</strong> {selectedMsg.email}
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                    <strong>Date:</strong> {(new Date(selectedMsg.created_at).toLocaleTimeString())}
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <strong>Message:</strong>
                                    <div style={{ marginTop: 6, background: '#23264a', padding: 12, borderRadius: 6, color: '#e7e9ff' }}>
                                        {selectedMsg.message}
                                    </div>
                                </div>
                                <div className="details-actions" style={{ marginTop: 16 }}>
                                    <button className="btn ghost" type="button" onClick={() => setSelectedMsg(null)}>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Support;