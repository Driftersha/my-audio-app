import { API_BASE } from './constants';
import type { Track } from '../types/track';

export async function getTracks(token: string): Promise<Track[]> {
  const res = await fetch(`${API_BASE}/tracks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error('Ошибка при загрузке треков: ' + errorText);
  }

  return res.json();
}








