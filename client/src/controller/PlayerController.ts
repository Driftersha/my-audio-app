import type { Track } from '../types/track';
import { FooterPlayer } from '../components/FooterPlayer';

export class PlayerController {
  private currentTrack: Track | null = null;

  constructor(private footerPlayer: FooterPlayer) { }

  setTrack(track: Track, trackList: Track[]) {
    this.currentTrack = track;
    this.footerPlayer.setTrack(track, trackList);
  }

  play() {
    this.footerPlayer.play();
  }

  updateFavoriteState(favoriteIds: Set<number>, tracks: Track[]) {
    if (this.currentTrack) {
      this.currentTrack.isFavorite = favoriteIds.has(this.currentTrack.id);
      this.footerPlayer.setTrack(this.currentTrack, tracks);
    }
  }

  getCurrentTrack(): Track | null {
    return this.currentTrack;
  }
}
