import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./components/LoginComponent"; 
import Dashboard from "./components/DashboardComponent/Dashboard";
import ProtectedRoute from "./components/ProtectedRouteComponent/ProtectedRoute";
import Users from "./components/userComponent/Users";
import Admin from "./components/adminComponent/Admin";
import Appsetting from "./components/AppsettingComponent/Appsetting";

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

        <Route 
          path='/users' 
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          } 
        />

        <Route 
          path='/admins' 
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } 
        />

        <Route 
          path='/appSettings' 
          element={
            <ProtectedRoute>
              <Appsetting />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;