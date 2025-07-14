import type { Track } from '../types/track';
import { favoritesStore } from '../store/favorites';

export class RouterController {
  constructor(
    private allTracks: Track[],
    private searchQuery: string,
  ) { }

  public filterTracksByRoute(): Track[] {
    const hash = window.location.hash;
    const favoriteIds = favoritesStore.getFavoriteIds();

    let filtered = this.allTracks.map(track => ({
      ...track,
      isFavorite: favoriteIds.has(track.id),
    }));

    if (hash === '#/favorites') {
      filtered = filtered.filter(track => track.isFavorite);
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(track =>
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query)
      );
    }

    return filtered;
  }
}

