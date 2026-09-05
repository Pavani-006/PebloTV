import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { Plus, Edit3, Trash2, Film, CheckCircle, Clock } from 'lucide-react';

export default function ShowsListPage() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newSection, setNewSection] = useState('series');
  const [newCategory, setNewCategory] = useState('adventure, learning');
  const [newSynopsis, setNewSynopsis] = useState('');

  const fetchShows = async () => {
    try {
      const data = await apiFetch('/admin/shows');
      setShows(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  const handleCreateShow = async (e) => {
    e.preventDefault();
    try {
      const cats = newCategory.split(',').map(c => c.trim()).filter(Boolean);
      await apiFetch('/admin/shows', {
        method: 'POST',
        body: {
          title: newTitle,
          slug: newSlug || newTitle.toLowerCase().replace(/\s+/g, '-'),
          section: newSection || null,
          category: cats,
          synopsis: newSynopsis,
          status: 'draft'
        }
      });
      setShowModal(false);
      setNewTitle('');
      setNewSlug('');
      setNewSynopsis('');
      fetchShows();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteShow = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete show "${title}"?`)) return;
    try {
      await apiFetch(`/admin/shows/${id}`, { method: 'DELETE' });
      fetchShows();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Show Catalog Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Manage shows, seasons, episodes, and artwork assets before publishing.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add New Show
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading show catalog...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {shows.map(show => (
            <div key={show.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span className={`badge ${show.status === 'published' ? 'badge-published' : 'badge-draft'}`}>
                    {show.status}
                  </span>
                  {show.section && (
                    <span className="badge badge-section">{show.section}</span>
                  )}
                </div>

                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>{show.title}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {show.synopsis || 'No synopsis provided.'}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {(show.category || []).map(cat => (
                    <span key={cat} style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      #{cat}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid var(--border-muted)' }}>
                <Link to={`/shows/${show.id}`} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  <Edit3 size={16} /> Manage & Edit
                </Link>
                <button onClick={() => handleDeleteShow(show.id, show.title)} className="btn-danger">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Create Show */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px' }}>Create New Show</h2>
            <form onSubmit={handleCreateShow}>
              <div className="form-group">
                <label className="form-label">Show Title</label>
                <input className="form-input" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Slug</label>
                <input className="form-input" value={newSlug} onChange={e => setNewSlug(e.target.value)} placeholder="auto-generated-if-empty" />
              </div>
              <div className="form-group">
                <label className="form-label">Catalog Section</label>
                <select className="form-select" value={newSection} onChange={e => setNewSection(e.target.value)}>
                  <option value="featured">featured</option>
                  <option value="series">series</option>
                  <option value="minisodes">minisodes</option>
                  <option value="songs">songs</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Categories (comma-separated)</label>
                <input className="form-input" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Synopsis</label>
                <textarea className="form-textarea" rows={3} value={newSynopsis} onChange={e => setNewSynopsis(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Show</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
