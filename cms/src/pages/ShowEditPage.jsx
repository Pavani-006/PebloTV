import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../api/client';
import ArtworkUploader from '../components/ArtworkUploader';
import { ArrowLeft, Save, Plus, Trash2, Globe, Clock, Tv } from 'lucide-react';

export default function ShowEditPage() {
  const { showId } = useParams();
  const [show, setShow] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [episodesMap, setEpisodesMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Form states for Show
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [section, setSection] = useState('series');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('draft');

  // Episode Add Modal
  const [epModalSeasonId, setEpModalSeasonId] = useState(null);
  const [epTitle, setEpTitle] = useState('');
  const [epNum, setEpNum] = useState(1);
  const [epDuration, setEpDuration] = useState(300);
  const [epLang, setEpLang] = useState('en');
  const [epGroup, setEpGroup] = useState('');
  const [epStatus, setEpStatus] = useState('published');

  const loadShowData = async () => {
    try {
      const showData = await apiFetch(`/admin/shows/${showId}`);
      setShow(showData);
      setTitle(showData.title);
      setSynopsis(showData.synopsis || '');
      setSection(showData.section || '');
      setCategory((showData.category || []).join(', '));
      setStatus(showData.status);

      const seasonsData = await apiFetch(`/admin/seasons/show/${showId}`);
      setSeasons(seasonsData);

      const epMap = {};
      for (const s of seasonsData) {
        const eps = await apiFetch(`/admin/episodes/season/${s.id}`);
        epMap[s.id] = eps;
      }
      setEpisodesMap(epMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShowData();
  }, [showId]);

  const handleUpdateShow = async (e) => {
    e.preventDefault();
    try {
      const cats = category.split(',').map(c => c.trim()).filter(Boolean);
      await apiFetch(`/admin/shows/${showId}`, {
        method: 'PUT',
        body: {
          title,
          synopsis,
          section: section || null,
          category: cats,
          status
        }
      });
      alert('Show metadata updated successfully!');
      loadShowData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddSeason = async (seasonNumber) => {
    try {
      await apiFetch('/admin/seasons', {
        method: 'POST',
        body: {
          show_id: showId,
          season_number: seasonNumber,
          title: seasonNumber === 0 ? "Trailers & Extras" : `Season ${seasonNumber}`
        }
      });
      loadShowData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateEpisode = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/admin/episodes', {
        method: 'POST',
        body: {
          season_id: epModalSeasonId,
          episode_number: parseInt(epNum),
          title: epTitle,
          duration: parseInt(epDuration),
          language: epLang,
          content_group: epGroup || `${show.slug}-s01e0${epNum}`,
          status: epStatus
        }
      });
      setEpModalSeasonId(null);
      setEpTitle('');
      loadShowData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteEpisode = async (epId) => {
    if (!window.confirm('Delete this episode?')) return;
    try {
      await apiFetch(`/admin/episodes/${epId}`, { method: 'DELETE' });
      loadShowData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading show details...</div>;

  return (
    <div className="cms-page" style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 24px' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      <div className="show-edit-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
        {/* Main Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Metadata Form */}
          <div className="glass-card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px' }}>Show Settings & Metadata</h2>
            <form onSubmit={handleUpdateShow}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="draft">draft</option>
                    <option value="published">published</option>
                  </select>
                </div>
              </div>

              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Catalog Section</label>
                  <select className="form-select" value={section} onChange={e => setSection(e.target.value)}>
                    <option value="">-- None (Draft) --</option>
                    <option value="featured">featured</option>
                    <option value="series">series</option>
                    <option value="minisodes">minisodes</option>
                    <option value="songs">songs</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Categories (comma-separated)</label>
                  <input className="form-input" value={category} onChange={e => setCategory(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Synopsis</label>
                <textarea className="form-textarea" rows={3} value={synopsis} onChange={e => setSynopsis(e.target.value)} />
              </div>

              <button type="submit" className="btn-primary">
                <Save size={18} /> Save Metadata
              </button>
            </form>
          </div>

          {/* Seasons & Episodes Section */}
          <div>
            <div className="section-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Seasons & Episode Manager</h2>
                <div className="section-toolbar-actions" style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-secondary" onClick={() => handleAddSeason(0)}>+ Add Season 0 (Trailers)</button>
                <button className="btn-primary" onClick={() => handleAddSeason(seasons.length > 0 ? Math.max(...seasons.map(s => s.season_number)) + 1 : 1)}>
                  <Plus size={16} /> Add Next Season
                </button>
              </div>
            </div>

            {seasons.map(s => (
              <div key={s.id} className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                    {s.season_number === 0 ? 'Season 0 — Trailers & Promos' : `Season ${s.season_number}`}
                  </h3>
                  <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => { setEpModalSeasonId(s.id); setEpNum((episodesMap[s.id]?.length || 0) + 1); }}>
                    <Plus size={14} /> Add Episode
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(episodesMap[s.id] || []).map(ep => (
                    <div key={ep.id} style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-muted)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--accent-pink)', width: '30px' }}>#{ep.episode_number}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{ep.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '12px', marginTop: '4px' }}>
                            <span>Group: <strong>{ep.content_group}</strong></span>
                            <span>Lang: <strong>{ep.language.toUpperCase()}</strong></span>
                            <span>Duration: {ep.duration ? `${ep.duration}s` : 'MISSING'}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={`badge ${ep.status === 'published' ? 'badge-published' : 'badge-draft'}`}>
                          {ep.status}
                        </span>
                        <button onClick={() => handleDeleteEpisode(ep.id)} className="btn-danger" style={{ padding: '6px 10px' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!episodesMap[s.id] || episodesMap[s.id].length === 0) && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>No episodes in this season yet.</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column Artwork Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Show Artwork Assets</h2>
          <ArtworkUploader type="poster" showId={showId} currentUrl={show.artwork?.find(a => a.type === 'poster')?.url} onUploadSuccess={loadShowData} />
          <ArtworkUploader type="banner" showId={showId} currentUrl={show.artwork?.find(a => a.type === 'banner')?.url} onUploadSuccess={loadShowData} />
        </div>
      </div>

      {/* Episode Creation Modal */}
      {epModalSeasonId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="glass-card cms-dialog" style={{ width: '100%', maxWidth: '480px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>Add Episode Variant</h2>
            <form onSubmit={handleCreateEpisode}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Episode #</label>
                  <input type="number" className="form-input" value={epNum} onChange={e => setEpNum(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Language</label>
                  <select className="form-select" value={epLang} onChange={e => setEpLang(e.target.value)}>
                    <option value="en">English (en)</option>
                    <option value="hi">Hindi (hi)</option>
                    <option value="es">Spanish (es)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" value={epTitle} onChange={e => setEpTitle(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Content Group Identifier</label>
                <input className="form-input" value={epGroup} onChange={e => setEpGroup(e.target.value)} placeholder={`e.g. ${show.slug}-s01e0${epNum}`} required />
              </div>

              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Duration (seconds)</label>
                  <input type="number" className="form-input" value={epDuration} onChange={e => setEpDuration(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Publish Status</label>
                  <select className="form-select" value={epStatus} onChange={e => setEpStatus(e.target.value)}>
                    <option value="published">published</option>
                    <option value="draft">draft</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={() => setEpModalSeasonId(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Episode</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
