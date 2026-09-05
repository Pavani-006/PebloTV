import React, { useState } from 'react';
import { apiFetch } from '../api/client';
import { Upload, CheckCircle, AlertTriangle, Image as ImageIcon } from 'lucide-react';

export default function ArtworkUploader({ type, showId, episodeId, currentUrl, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(currentUrl || null);

  const specs = {
    poster: "Poster (2:3 aspect ratio, 600x900px, Max 200KB)",
    banner: "Banner (16:9 aspect ratio, 1280x720px, Max 200KB)",
    thumbnail: "Thumbnail (16:9 aspect ratio, 640x360px, Max 200KB)"
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append('type', type);
    if (showId) formData.append('show_id', showId);
    if (episodeId) formData.append('episode_id', episodeId);
    formData.append('file', file);

    try {
      const res = await apiFetch('/admin/artwork/upload', {
        method: 'POST',
        body: formData
      });
      setPreview(res.url);
      if (onUploadSuccess) onUploadSuccess(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>
          {type} Artwork
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {specs[type]}
        </span>
      </div>

      {preview ? (
        <div style={{ position: 'relative', width: '100%', height: type === 'poster' ? '180px' : '110px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-muted)' }}>
          <img src={preview} alt={type} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <label style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            background: 'rgba(0,0,0,0.7)',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Upload size={12} /> Replace
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
        </div>
      ) : (
        <label style={{
          border: '2px dashed var(--border-muted)',
          borderRadius: '10px',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255,255,255,0.02)',
          transition: 'all 0.2s ease'
        }}>
          <ImageIcon size={24} color="var(--text-muted)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {uploading ? 'Uploading & Validating...' : 'Click to Upload Artwork'}
          </span>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} disabled={uploading} style={{ display: 'none' }} />
        </label>
      )}

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          fontSize: '0.8rem',
          padding: '8px 12px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <AlertTriangle size={14} /> {error}
        </div>
      )}
    </div>
  );
}
