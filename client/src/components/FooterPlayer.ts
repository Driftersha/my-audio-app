import { el } from 'redom';
import { PlaybackControls } from './PlaybackControls';
import { FavoriteToggleButton } from './FavoriteToggleButton';
import type { Track } from '../types/track';
import placeholderImage from '../assets/img/placeholder.png';
import { favoritesStore } from '../store/favorites';
import { formatDuration } from '../utils/formatDuration';
import fallbackMp3 from '../assets/audio/the-business.mp3';


function resolveCover(cover: string | undefined): string {
  if (!cover) return placeholderImage;
  const isFilename = !cover.startsWith('http') && !cover.includes('/');
  return isFilename ? `/img/${cover}` : cover;
}

export class FooterPlayer {
  el: HTMLElement;

  private controls: PlaybackControls;
  private favoriteBtn: FavoriteToggleButton;
  private audio: HTMLAudioElement;

  private currentTrack: Track | null = null;
  private trackList: Track[] = [];

  private repeat = false;
  private shuffle = false;

  private trackInfoEl: HTMLElement;

  constructor() {
    this.controls = new PlaybackControls();
    this.audio = new Audio();
    this.audio.preload = 'auto';

    this.favoriteBtn = new FavoriteToggleButton({
      isFavorite: false,
      onToggle: () => {
        if (!this.currentTrack) return;
        favoritesStore.toggleFavorite(this.currentTrack.id);
      },
    });

    this.trackInfoEl = el('.footer-player__track-info', [
      el('img.footer-player__cover', {
        src: placeholderImage,
        alt: 'Обложка',
        width: 60,
        height: 60,
        draggable: false,
      }),
      el('.footer-player__info', [
        el('.footer-player__box', [
          el('.footer-player__title-wrapper', [
            el('h3.footer-player__title', 'Нет трека'),
            this.favoriteBtn.el,
          ]),
          el('h3.footer-player__artist', '—'),
        ]),
      ]),
    ]);

    const footerMain = el('.footer-player__main', [
      this.controls.el,
    ]);

    const wrapper = el('.footer-player__wrapper', [
      this.trackInfoEl,
      footerMain,
      this.controls.volumeEl,
    ]);

    const container = el('.container.container--footer', wrapper);
    this.el = el('footer.footer-player', container);

    this.initAudioEvents();
    this.initControlHandlers();
    this.subscribeToFavorites();
    this.updateProgress(0, 0);
  }

  public play() {
    this.audio.play();
    this.controls.setVisualState('playing');
  }

  private initControlHandlers() {
    this.controls.onPlay = () => {
      if (this.audio.src) {
        this.audio.play();
        this.controls.setVisualState('playing');
      }
    };

    this.controls.onPause = () => {
      this.audio.pause();
      this.controls.setVisualState('paused');
    };

    this.controls.onStop = () => {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.updateProgress(0, this.audio.duration);
      this.controls.setVisualState('stopped');
    };

    this.controls.onNext = () => this.playNext();
    this.controls.onPrev = () => this.playPrev();

    this.controls.onRepeat = () => {
      this.repeat = !this.repeat;
      this.shuffle = this.repeat ? false : this.shuffle;
      this.audio.loop = this.repeat;
      this.updateToggleStates();
    };

    this.controls.onShuffle = () => {
      this.shuffle = !this.shuffle;
      this.repeat = this.shuffle ? false : this.repeat;
      this.audio.loop = false;
      this.updateToggleStates();
    };

    this.controls.onVolume = (volume: number) => {
      this.audio.volume = volume;
    };

    this.controls.onSeek = (percent: number) => {
      if (this.audio.duration) {
        this.audio.currentTime = (percent / 100) * this.audio.duration;
      }
    };
  }

  private initAudioEvents() {
    this.audio.addEventListener('loadedmetadata', () => {
      this.updateProgress(this.audio.currentTime, this.audio.duration);
    });

    this.audio.addEventListener('timeupdate', () => {
      this.updateProgress(this.audio.currentTime, this.audio.duration);
    });

    this.audio.addEventListener('ended', () => {
      if (!this.repeat) {
        this.playNext();
      }
    });
  }

  private subscribeToFavorites() {
    favoritesStore.subscribe(() => {
      if (this.currentTrack) {
        const isFavorite = favoritesStore.isFavorite(this.currentTrack.id);
        this.favoriteBtn.setState(isFavorite);
      }
    });
  }

  setTrack(track: Track, trackList: Track[] = []) {
    this.currentTrack = track;
    if (trackList.length) {
      this.trackList = trackList;
    }

    const hasValidAudio =
      typeof track.encoded_audio === 'string' &&
      track.encoded_audio.startsWith('http') &&
      track.encoded_audio.includes('.mp3');

    this.audio.src = hasValidAudio ? track.encoded_audio! : fallbackMp3;

    this.audio.currentTime = 0;
    this.audio.pause();
    this.controls.setVisualState('stopped');
    this.updateProgress(0, 0);

    const cover = this.trackInfoEl.querySelector('.footer-player__cover') as HTMLImageElement;
    const title = this.trackInfoEl.querySelector('.footer-player__title')!;
    const artist = this.trackInfoEl.querySelector('.footer-player__artist')!;

    cover.src = resolveCover(track.cover);
    title.textContent = hasValidAudio ? track.title : 'Аудиофайл недоступен';
    artist.textContent = hasValidAudio ? (track.artist || '—') : '';

    const isFavorite = favoritesStore.isFavorite(track.id);
    this.favoriteBtn.setState(isFavorite);

    this.controls.playButton.disabled = !hasValidAudio;
  }

  private updateProgress(current: number, total: number) {
    this.controls.currentTimeDisplay.textContent = formatDuration(current);
    this.controls.durationEl.textContent = formatDuration(total);

    const percent = total > 0 ? (current / total) * 100 : 0;
    this.controls.progressInput.value = percent.toString();

    this.controls.progressInput.style.background = `
    linear-gradient(to right, #fc6d3e 0%, #fc6d3e ${percent}%, #e8e8e8 ${percent}%, #e8e8e8 100%)
  `;
  }

  private playNext() {
    if (!this.currentTrack || !this.trackList.length) return;

    const currentIndex = this.trackList.findIndex(t => t.id === this.currentTrack!.id);
    if (currentIndex === -1) return;

    const nextIndex = this.shuffle
      ? this.getRandomIndex(currentIndex)
      : (currentIndex + 1) % this.trackList.length;

    this.setTrack(this.trackList[nextIndex], this.trackList);
    this.audio.play();
    this.controls.setVisualState('playing');
  }

  private playPrev() {
    if (!this.currentTrack || !this.trackList.length) return;

    const currentIndex = this.trackList.findIndex(t => t.id === this.currentTrack!.id);
    if (currentIndex === -1) return;

    const prevIndex = this.shuffle
      ? this.getRandomIndex(currentIndex)
      : (currentIndex - 1 + this.trackList.length) % this.trackList.length;

    this.setTrack(this.trackList[prevIndex], this.trackList);
    this.audio.play();
    this.controls.setVisualState('playing');
  }

  private getRandomIndex(currentIndex: number): number {
    let index = currentIndex;
    while (index === currentIndex && this.trackList.length > 1) {
      index = Math.floor(Math.random() * this.trackList.length);
    }
    return index;
  }

  private toggleClass(btn: HTMLElement, isActive: boolean) {
    btn.classList.toggle('active', isActive);
  }

  private updateToggleStates() {
    this.toggleClass(this.controls.repeatBtn, this.repeat);
    this.toggleClass(this.controls.shuffleBtn, this.shuffle);
  }
}


















