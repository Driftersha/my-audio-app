import { API_BASE } from './constants';

export async function getFavorites(token: string): Promise<number[]> {
  const res = await fetch(`${API_BASE}/favorites`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error('Ошибка при получении избранного: ' + errorText);
  }

  const data = await res.json();
  return data.map((track: { id: number }) => track.id);
}

export async function addFavorite(trackId: number, token: string): Promise<void> {
  await fetch(`${API_BASE}/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ trackId }),
  });
}

export async function removeFavorite(trackId: number, token: string): Promise<void> {
  await fetch(`${API_BASE}/favorites`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ trackId }),
  });
}






