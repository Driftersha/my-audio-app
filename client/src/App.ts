import { el } from 'redom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AudioListSection } from './components/AudioListSection';
import { FooterPlayer } from './components/FooterPlayer';
import { getTracks } from './api/tracks';
import { favoritesStore } from './store/favorites';
import type { Track } from './types/track';

export class App {
  el: HTMLElement;

  private footerPlayer: FooterPlayer;
  private AudioListSection: AudioListSection;
  private currentTrack: Track | null = null;
  private allTracks: Track[] = [];
  private header: Header;
  private searchQuery = '';

  constructor() {
    const sidebar = new Sidebar();

    this.header = new Header({
      onSearch: (query) => this.handleSearch(query),
    });

    this.footerPlayer = new FooterPlayer();

    this.AudioListSection = new AudioListSection(
      (track: Track) => {
        this.setCurrentTrack(track);
        this.footerPlayer.play();
      },
      favoritesStore
    );


    this.el = el('div.app', [
      sidebar.el,
      this.header.el,
      el('main.content', this.AudioListSection.el),
      this.footerPlayer.el,
    ]);


    favoritesStore.subscribe(() => {
      this.updateFavoritesState();
      this.renderTracksByRoute();
    });

    window.addEventListener('hashchange', () => this.renderTracksByRoute());

    this.init();
  }

  private async init() {
    try {
      await favoritesStore.loadFromServer();

      const token = localStorage.getItem('token');
      if (!token) return;

      this.allTracks = await getTracks(token);

      if (!window.location.hash) {
        window.location.hash = '#/tracks';
      }

      this.renderTracksByRoute();
    } catch (error) {
      console.error('Ошибка при инициализации приложения:', error);
    }
  }

  private renderTracksByRoute() {
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

    this.AudioListSection.setTracks(filtered);

    if (filtered.length > 0) {
      this.setCurrentTrack(filtered[0], filtered);
    }
  }

  private handleSearch(query: string) {
    this.searchQuery = query;
    this.renderTracksByRoute();
  }

  private updateFavoritesState() {
    const favoriteIds = favoritesStore.getFavoriteIds();
    this.AudioListSection.updateFavorites(favoriteIds);

    if (this.currentTrack) {
      this.currentTrack.isFavorite = favoriteIds.has(this.currentTrack.id);
      this.footerPlayer.setTrack(this.currentTrack, this.AudioListSection.getTracks());
    }
  }

  private setCurrentTrack(track: Track, trackList: Track[] = []) {
    this.currentTrack = track;
    this.footerPlayer.setTrack(track, trackList);

  }
}










