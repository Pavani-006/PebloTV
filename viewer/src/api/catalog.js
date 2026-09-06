const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

function normalizeMediaUrls(value) {
  if (typeof value === 'string' && value.startsWith('/media/')) {
    return `${API_BASE_URL}${value}`;
  }

  if (Array.isArray(value)) {
    return value.map(normalizeMediaUrls);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, normalizeMediaUrls(nestedValue)])
    );
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
