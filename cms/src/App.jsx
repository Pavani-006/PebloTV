import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import ShowsListPage from './pages/ShowsListPage';
import ShowEditPage from './pages/ShowEditPage';
import PublishDashboardPage from './pages/PublishDashboardPage';

function ProtectedLayout() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<ShowsListPage />} />
        <Route path="/shows/:showId" element={<ShowEditPage />} />
        <Route path="/publish" element={<PublishDashboardPage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
