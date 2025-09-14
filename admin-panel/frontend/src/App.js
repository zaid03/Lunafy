import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./components/LoginComponent"; 
import Dashboard from "./components/DashboardComponent/Dashboard";
import ProtectedRoute from "./components/ProtectedRouteComponent/ProtectedRoute";

function App() {
  return(
    <Router>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route 
          path='/dashboard' 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;