import { getFavorites, addFavorite, removeFavorite } from '../api/favorites';

type Listener = () => void;

export class FavoritesStore {
  private token: string;
  private favoriteIds: Set<number> = new Set();
  private addedDates: Map<number, string> = new Map();
  private listeners: Listener[] = [];

  constructor(token: string) {
    this.token = token;
    this.loadDatesFromStorage();
  }

  async loadFromServer() {
    const ids = await getFavorites(this.token);
    this.favoriteIds = new Set(ids.map(Number));

    ids.forEach((id: number | string) => {
      const numId = Number(id);
      if (!this.addedDates.has(numId)) {
        this.addedDates.set(numId, new Date().toISOString());
      }
    });

    this.saveDatesToStorage();
    this.emitChange();
  }

  getFavoriteIds(): Set<number> {
    return new Set(this.favoriteIds);
  }

  isFavorite(trackId: number): boolean {
    return this.favoriteIds.has(trackId);
  }

  getDate(trackId: number): string | null {
    return this.addedDates.get(trackId) ?? null;
  }

  async toggleFavorite(trackId: number) {
    const isNowFavorite = this.isFavorite(trackId);

    try {
      if (isNowFavorite) {
        await removeFavorite(trackId, this.token);
        this.favoriteIds.delete(trackId);
        this.addedDates.delete(trackId);
      } else {
        await addFavorite(trackId, this.token);
        this.favoriteIds.add(trackId);
        this.addedDates.set(trackId, new Date().toISOString());
      }

      this.saveDatesToStorage();
      this.emitChange();
    } catch (error) {
      console.error('Ошибка при обновлении избранного:', error);
    }
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
  }

  unsubscribe(listener: Listener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  private emitChange() {
    this.listeners.forEach((fn) => fn());
  }

  private saveDatesToStorage() {
    const obj = Object.fromEntries(this.addedDates);
    localStorage.setItem('favoriteDates', JSON.stringify(obj));
  }

  private loadDatesFromStorage() {
    const raw = localStorage.getItem('favoriteDates');
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      this.addedDates = new Map(
        Object.entries(parsed).map(([id, isoDate]) => [Number(id), isoDate as string])
      );
    } catch (e) {
      console.error('Не удалось загрузить даты из localStorage', e);
    }
  }
}




