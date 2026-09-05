import React, { useState, useEffect } from 'react';
import { fetchCatalog } from '../api/catalog';
import HeroBanner from '../components/HeroBanner';
import ShowCard from '../components/ShowCard';
import ShowDetailModal from '../components/ShowDetailModal';
import { Flame, Sparkles, Film, Music, Tv } from 'lucide-react';

export default function HomePage({ searchQuery }) {
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchCatalog()
      .then(setCatalog)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>Loading Peblo TV catalog...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '100px', color: '#fca5a5' }}>{error}</div>;

  const sections = catalog?.sections || [];
  const featuredShow = sections[0]?.shows?.[0] || null;

  const categories = ['all', 'adventure', 'india', 'learning', 'music', 'science', 'stories'];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 40px 80px' }}>
      {/* Featured Hero Banner */}
      <HeroBanner show={featuredShow} onSelectShow={setSelectedShow} />

      {/* Category Pills Bar */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '40px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
            style={{ textTransform: 'capitalize' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Section Rows */}
      {sections.map(section => {
        const filteredShows = (section.shows || []).filter(show => {
          if (activeCategory === 'all') return true;
          return (show.category || []).map(c => c.toLowerCase()).includes(activeCategory.toLowerCase());
        });

        if (filteredShows.length === 0) return null;

        return (
          <div key={section.name} style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'capitalize' }}>
              <Flame size={22} color="var(--accent-pink)" /> {section.name} Shows
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '24px'
            }}>
              {filteredShows.map(show => (
                <ShowCard key={show.id} show={show} onSelectShow={setSelectedShow} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Detail Modal */}
      {selectedShow && (
        <ShowDetailModal show={selectedShow} onClose={() => setSelectedShow(null)} />
      )}
    </div>
  );
}
