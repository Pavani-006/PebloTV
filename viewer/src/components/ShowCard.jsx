import React, { useState } from 'react';
import { Play } from 'lucide-react';

export default function ShowCard({ show, onSelectShow }) {
  const [posterError, setPosterError] = useState(false);
  const posterUrl = posterError ? null : show.artwork?.poster;

  return (
    <div className="poster-card" onClick={() => onSelectShow(show)}>
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={show.title}
          loading="lazy"
          onError={() => setPosterError(true)}
        />
      ) : (
        <div className="poster-artwork-fallback" aria-label={`${show.title} artwork unavailable`}>
          <span>{show.title}</span>
        </div>
      )}
      <div className="poster-overlay">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: '4px' }}>{show.title}</h3>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(show.category || []).slice(0, 2).map(cat => (
            <span key={cat} style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', color: '#e2e8f0' }}>
              {cat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
