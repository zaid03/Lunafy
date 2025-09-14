import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/test-session', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setStatus(d.userId ? 'ok' : 'no'))
      .catch(() => setStatus('no'));
  }, []);

  if (status === 'loading') return null;
  if (status === 'no') return <Navigate to="/" replace />;
  return children;
}