import React, { useState } from 'react';
import { X, Play, Clock, Globe, Film, Sparkles } from 'lucide-react';

export default function ShowDetailModal({ show, onClose }) {
  if (!show) return null;

  const [activeTab, setActiveTab] = useState(show.seasons?.[0]?.season_number || (show.trailers?.length > 0 ? 0 : 1));
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  const currentSeason = show.seasons?.find(s => s.season_number === activeTab);
  const trailers = show.trailers || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Banner Header */}
        <div style={{ position: 'relative', height: '280px', width: '100%', overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
          <img
            src={show.artwork?.banner || show.artwork?.poster || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=80'}
            alt={show.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%', width: '36px', height: '36px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
            }}
          >
            <X size={20} />
          </button>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, var(--bg-surface) 0%, transparent 80%)'
          }} />
        </div>

        <div style={{ padding: '32px', marginTop: '-40px', position: 'relative' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>{show.title}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
            {show.synopsis}
          </p>

          {/* Season Selector Tabs */}
          <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '24px' }}>
            {(show.seasons || []).map(s => (
              <button
                key={s.season_number}
                onClick={() => setActiveTab(s.season_number)}
                className={`category-pill ${activeTab === s.season_number ? 'active' : ''}`}
              >
                Season {s.season_number}
              </button>
            ))}

            {trailers.length > 0 && (
              <button
                onClick={() => setActiveTab(0)}
                className={`category-pill ${activeTab === 0 ? 'active' : ''}`}
                style={{ borderColor: 'var(--accent-pink)' }}
              >
                <Sparkles size={14} style={{ display: 'inline', marginRight: '4px' }} /> Season 0 (Trailers)
              </button>
            )}

            {/* Language filter for active season */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={16} color="var(--text-muted)" />
              <select
                value={selectedLanguage}
                onChange={e => setSelectedLanguage(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem' }}
              >
                <option value="all">All Audio Languages</option>
                <option value="en">English (en)</option>
                <option value="hi">Hindi (hi)</option>
              </select>
            </div>
          </div>

          {/* Season Episodes List */}
          {activeTab !== 0 && currentSeason && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(currentSeason.episodes || [])
                .filter(ep => selectedLanguage === 'all' || (ep.languages || []).includes(selectedLanguage))
                .map((group, idx) => (
                  <div key={group.content_group} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px'
                  }}>
                    <div style={{
                      width: '120px', height: '68px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0,
                      background: 'rgba(255,255,255,0.05)', position: 'relative'
                    }}>
                      {group.artwork?.thumbnail ? (
                        <img src={group.artwork.thumbnail} alt={group.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Film size={24} color="var(--text-muted)" />
                        </div>
                      )}
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Play size={20} fill="white" color="white" />
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Ep {idx + 1}. {group.title}</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> {group.duration ? `${Math.round(group.duration / 60)} min` : '5 min'}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>{group.description}</p>
                      
                      <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                        {(group.languages || []).map(lang => (
                          <span key={lang} style={{ background: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139, 92, 246, 0.4)', color: '#c4b5fd', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                            {lang.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Trailers (Season 0) List */}
          {activeTab === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {trailers.map((t, idx) => (
                <div key={t.id} style={{
                  background: 'rgba(236, 72, 153, 0.08)',
                  border: '1px solid rgba(236, 72, 153, 0.2)',
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px'
                }}>
                  <div style={{ width: '120px', height: '68px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Play size={24} fill="#ec4899" color="#ec4899" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fbcfe8' }}>Trailer: {t.title}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>{t.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
