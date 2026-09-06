import React from 'react';
import { X } from 'lucide-react';

export default function VideoPlayerModal({ show, onClose }) {
  if (!show?.video_url) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content video-player-modal" onClick={event => event.stopPropagation()}>
        <div className="video-player-header">
          <h2>{show.title}</h2>
          <button type="button" onClick={onClose} aria-label="Close video player">
            <X size={20} />
          </button>
        </div>
        <div className="video-player-frame">
          <iframe
            src={`${show.video_url}?autoplay=1&rel=0`}
            title={`${show.title} video`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}