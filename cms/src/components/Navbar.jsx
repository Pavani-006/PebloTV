import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tv, Film, Send, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-muted)',
      padding: '16px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '1.25rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex'
          }}>
            <Tv size={20} color="white" />
          </div>
          <span>Peblo <span style={{ color: 'var(--accent-pink)' }}>CMS</span></span>
        </Link>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link
            to="/"
            className={`btn-secondary ${isActive('/') ? 'active' : ''}`}
            style={{
              borderColor: isActive('/') ? 'var(--accent-purple)' : undefined,
              background: isActive('/') ? 'rgba(124, 58, 237, 0.2)' : undefined
            }}
          >
            <Film size={16} /> Shows & Episodes
          </Link>
          <Link
            to="/publish"
            className={`btn-secondary ${isActive('/publish') ? 'active' : ''}`}
            style={{
              borderColor: isActive('/publish') ? 'var(--accent-purple)' : undefined,
              background: isActive('/publish') ? 'rgba(124, 58, 237, 0.2)' : undefined
            }}
          >
            <Send size={16} /> Publish Control
          </Link>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <User size={16} />
          <span>{user.username}</span>
          <span className={`badge ${user.role === 'admin' ? 'badge-published' : 'badge-section'}`}>
            {user.role}
          </span>
        </div>
        <button onClick={logout} className="btn-secondary" title="Logout">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
}
