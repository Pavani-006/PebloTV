import React, { useState } from 'react';
import { Play, Info, Sparkles } from 'lucide-react';

export default function HeroBanner({ show, onSelectShow, onPlayShow }) {
  if (!show) return null;

  const [bannerSourceIndex, setBannerSourceIndex] = useState(0);
  const motiHero = show.title === "Moti's Many Lives" ? '/moti-hero.jpg' : null;
  const bannerSources = [motiHero, show.artwork?.banner, show.artwork?.poster].filter(Boolean);
  const bannerUrl = bannerSources[bannerSourceIndex];

  return (
    <div className="hero-banner" style={{
      position: 'relative',
      width: '100%',
      height: '480px',
      borderRadius: '24px',
      overflow: 'hidden',
      marginBottom: '40px',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      {bannerUrl ? (
        <img
          className="hero-banner-image"
          src={bannerUrl}
          alt={show.title}
          onError={() => setBannerSourceIndex(index => index + 1)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div className="hero-artwork-fallback" aria-label={`${show.title} banner unavailable`}>
          <span>{show.title}</span>
        </div>
      )}

      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to right, rgba(7, 9, 14, 0.95) 0%, rgba(7, 9, 14, 0.6) 50%, transparent 100%), linear-gradient(to top, rgba(7, 9, 14, 0.9) 0%, transparent 60%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '48px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{
            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sparkles size={12} /> Featured Premiere
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Section: {show.section || 'Featured'}
          </span>
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '12px' }}>
          {show.title}
        </h1>

        <p style={{
          fontSize: '1rem',
          color: '#cbd5e1',
          maxWidth: '560px',
          lineHeight: 1.5,
          marginBottom: '24px',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {show.synopsis}
        </p>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            onClick={() => onPlayShow(show)}
            style={{
              background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
              color: 'white',
              padding: '14px 28px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 8px 25px rgba(236, 72, 153, 0.5)'
            }}
          >
            <Play size={20} fill="white" /> Watch Now
          </button>
          <button
            onClick={() => onSelectShow(show)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '14px 24px',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Info size={20} /> Details & Seasons
          </button>
        </div>
      </div>
    </div>
  );
}
