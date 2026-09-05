export async function fetchCatalog() {
  const response = await fetch('/catalog');
  if (!response.ok) {
    throw new Error('Failed to fetch catalog');
  }
  return response.json();
}

export async function searchCatalog(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`/catalog/search?${query}`);
  if (!response.ok) {
    throw new Error('Failed to search catalog');
  }
  return response.json();
}
