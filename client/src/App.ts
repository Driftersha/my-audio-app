import { el } from 'redom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AudioListSection } from './components/AudioListSection';
import { FooterPlayer } from './components/FooterPlayer';
import { getTracks } from './api/tracks';
import { favoritesStore } from './store/favorites';
import type { Track } from './types/track';
import { RouterController } from './controller/RouterController';
import { PlayerController } from './controller/PlayerController';


export class App {
  el: HTMLElement;

  private footerPlayer: FooterPlayer;
  private playerController: PlayerController;
  private audioListSection: AudioListSection;

  private allTracks: Track[] = [];
  private header: Header;
  private searchQuery = '';

  constructor() {
    const sidebar = new Sidebar();

    this.header = new Header({
      onSearch: (query) => this.handleSearch(query),
    });

    this.footerPlayer = new FooterPlayer();
    this.playerController = new PlayerController(this.footerPlayer);


    this.audioListSection = new AudioListSection(
      (track: Track) => {
        this.playerController.setTrack(track, this.audioListSection.getTracks());
        this.playerController.play();
      },
      favoritesStore
    );


    this.el = el('div.app', [
      sidebar.el,
      this.header.el,
      el('main.content', this.audioListSection.el),
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
    const router = new RouterController(this.allTracks, this.searchQuery);
    const filtered = router.filterTracksByRoute();

    this.audioListSection.setTracks(filtered);

    if (filtered.length > 0) {
      this.playerController.setTrack(filtered[0], filtered);
    }
  }

  private handleSearch(query: string) {
    this.searchQuery = query;
    this.renderTracksByRoute();
  }

  private updateFavoritesState() {
    const favoriteIds = favoritesStore.getFavoriteIds();
    this.audioListSection.updateFavorites(favoriteIds);
    this.playerController.updateFavoriteState(favoriteIds, this.audioListSection.getTracks());
  }

}










