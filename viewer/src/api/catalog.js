const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const VIDEO_SOURCES = {
  "Moti's Many Lives": 'https://www.youtube.com/embed/1p7HEhdzVf4'
};

const TRAILER_SOURCES = {
  "Moti's Many Lives": {
    id: 'motis-many-lives-trailer',
    title: "Moti's Many Lives Trailer",
    description: 'Watch the Moti story preview.',
    video_url: VIDEO_SOURCES["Moti's Many Lives"]
  }
};

export function getTrailersForShow(show) {
  if (show?.trailers?.length) {
    return show.trailers;
  }

  return TRAILER_SOURCES[show?.title] ? [TRAILER_SOURCES[show.title]] : [];
}

function normalizeMediaUrls(value) {
  if (typeof value === 'string' && value.startsWith('/media/')) {
    return `${API_BASE_URL}${value}`;
  }

  if (Array.isArray(value)) {
    return value.map(normalizeMediaUrls);
  }

  if (value && typeof value === 'object') {
    const normalized = Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, normalizeMediaUrls(nestedValue)])
    );

    if (normalized.title && !normalized.video_url && VIDEO_SOURCES[normalized.title]) {
      normalized.video_url = VIDEO_SOURCES[normalized.title];
    }

    if (normalized.title && TRAILER_SOURCES[normalized.title] && !normalized.trailers?.length) {
      normalized.trailers = [TRAILER_SOURCES[normalized.title]];
    }

    return normalized;
  }

  return value;
}

export async function fetchCatalog() {
  const response = await fetch(`${API_BASE_URL}/catalog`);
  if (!response.ok) {
    throw new Error('Failed to fetch catalog');
  }
  return normalizeMediaUrls(await response.json());
}

export async function searchCatalog(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/catalog/search?${query}`);
  if (!response.ok) {
    throw new Error('Failed to search catalog');
  }
  return normalizeMediaUrls(await response.json());
}
