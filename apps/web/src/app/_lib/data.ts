/**
 * Private lib - not routable
 * Data fetching utilities for app routes
 */

export async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchWithCache<T>(
  url: string,
  cacheTime: number = 3600,
): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate: cacheTime },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  return response.json();
}
