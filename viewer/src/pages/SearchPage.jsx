import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchCatalog } from '../api/catalog';
import ShowCard from '../components/ShowCard';
import ShowDetailModal from '../components/ShowDetailModal';
import { Search } from 'lucide-react';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const section = searchParams.get('section') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShow, setSelectedShow] = useState(null);

  useEffect(() => {
    setLoading(true);
    searchCatalog({ q: query, section })
      .then(res => setResults(res.results || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query, section]);

  return (
    <div style={{ maxWidth: '1400px', margin: '40px auto', padding: '0 40px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
        {query ? `Search Results for "${query}"` : section ? `${section.toUpperCase()} Catalog` : 'Explore Catalog'}
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
        Found {results.length} matching shows and episodes
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Searching catalog...</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '24px'
        }}>
          {results.map(show => (
            <ShowCard key={show.id} show={show} onSelectShow={setSelectedShow} />
          ))}
          {results.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              No catalog matches found for your query.
            </div>
          )}
        </div>
      )}

      {selectedShow && (
        <ShowDetailModal show={selectedShow} onClose={() => setSelectedShow(null)} />
      )}
    </div>
  );
}
