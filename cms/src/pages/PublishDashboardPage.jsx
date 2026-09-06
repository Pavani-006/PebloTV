import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Send, AlertTriangle, CheckCircle2, History, RefreshCw } from 'lucide-react';

export default function PublishDashboardPage() {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const repData = await apiFetch('/admin/validation-report');
      setReport(repData);

      const histData = await apiFetch('/admin/catalog/history');
      setHistory(histData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePublish = async () => {
    if (!window.confirm("Trigger atomic catalog publish now?")) return;
    setPublishing(true);
    setPublishMessage(null);
    try {
      const res = await apiFetch('/admin/catalog/publish', { method: 'POST' });
      setPublishMessage({ type: 'success', text: `Catalog Version ${res.catalog_version} published successfully! Shows: ${res.show_count}, Episodes: ${res.episode_count}` });
      loadData();
    } catch (err) {
      setPublishMessage({ type: 'error', text: err.message });
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Analyzing validation report...</div>;

  return (
    <div className="cms-page publish-page" style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Catalog Publish Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Atomic release management with real-time pre-flight validation checks.
          </p>
        </div>
        <button className="btn-secondary" onClick={loadData}>
          <RefreshCw size={16} /> Refresh Audit
        </button>
      </div>

      {publishMessage && (
        <div style={{
          padding: '16px 20px',
          borderRadius: '12px',
          marginBottom: '24px',
          fontWeight: 500,
          background: publishMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: publishMessage.type === 'success' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
          color: publishMessage.type === 'success' ? '#34d399' : '#fca5a5'
        }}>
          {publishMessage.text}
        </div>
      )}

      {/* Validation Status Card */}
      <div className="glass-card" style={{ padding: '32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {report.can_publish ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '14px', color: '#34d399' }}>
                <CheckCircle2 size={32} />
              </div>
            ) : (
              <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '14px', color: '#fca5a5' }}>
                <AlertTriangle size={32} />
              </div>
            )}
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {report.can_publish ? 'Catalog Ready for Publish' : 'Publish Blocked by Validation Engine'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
                {report.can_publish ? 'All published items satisfy section, artwork, and duration requirements.' : `Found ${report.issue_count} blocking validation issues that must be fixed.`}
              </p>
            </div>
          </div>

          {user.role === 'admin' ? (
            <button
              className="btn-primary"
              disabled={!report.can_publish || publishing}
              onClick={handlePublish}
              style={{ padding: '12px 24px', opacity: report.can_publish ? 1 : 0.5 }}
            >
              <Send size={18} /> {publishing ? 'Publishing...' : 'Publish Current Catalog'}
            </button>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Admin privilege required to trigger publish
            </div>
          )}
        </div>

        {/* Blocking Error Report List */}
        {!report.can_publish && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            {report.errors.map((err, idx) => (
              <div key={idx} style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '10px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <AlertTriangle size={18} color="#fca5a5" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fca5a5' }}>{err.message}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Type: {err.type} | Entity: {err.entity_type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit History Log Table */}
      <div className="glass-card audit-card" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <History size={20} /> Publish Audit Log History
        </h2>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-muted)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px' }}>Version</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Triggered By</th>
              <th style={{ padding: '12px' }}>Shows</th>
              <th style={{ padding: '12px' }}>Episodes</th>
              <th style={{ padding: '12px' }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {history.map(run => (
              <tr key={run.id} style={{ borderBottom: '1px solid var(--border-muted)' }}>
                <td style={{ padding: '12px', fontWeight: 700 }}>v{run.catalog_version}</td>
                <td style={{ padding: '12px' }}>
                  <span className={`badge ${run.status === 'success' ? 'badge-published' : 'badge-draft'}`}>
                    {run.status}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{run.triggered_by}</td>
                <td style={{ padding: '12px' }}>{run.show_count}</td>
                <td style={{ padding: '12px' }}>{run.episode_count}</td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{new Date(run.started_at).toLocaleString()}</td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No publish runs recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
