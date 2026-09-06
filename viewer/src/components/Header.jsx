import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Tv, Search, Flame, Menu, X } from 'lucide-react';

export default function Header({ searchQuery, setSearchQuery }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const section = new URLSearchParams(location.search).get('section');
  const activeNavKey = location.pathname === '/'
    ? 'home'
    : location.pathname === '/search'
      ? section
      : null;

  const navItems = [
    { key: 'home', label: 'Home', to: '/' },
    { key: 'series', label: 'Series', to: '/search?section=series' },
    { key: 'minisodes', label: 'Minisodes', to: '/search?section=minisodes' },
    { key: 'songs', label: 'Singalongs', to: '/search?section=songs' }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="header-glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '16px 40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex'
          }}>
            <Tv size={22} color="white" />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
            PEBLO <span style={{ color: 'var(--accent-pink)' }}>TV</span>
          </span>
        </Link>

        <nav className={`main-nav${menuOpen ? ' main-nav-open' : ''}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              className={`nav-link${activeNavKey === item.key ? ' nav-link-active' : ''}`}
              to={item.to}
              end={item.key === 'home'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <button
        type="button"
        className="mobile-menu-button"
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(open => !open)}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <form className="header-search" onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '280px' }}>
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search shows, languages..."
          value={searchQuery || ''}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '30px',
            padding: '10px 16px 10px 42px',
            color: 'white',
            fontSize: '0.88rem',
            outline: 'none'
          }}
        />
      </form>
    </header>
  );
}
