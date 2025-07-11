export interface Track {
  id: number;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  size_mb: number;
  description?: string;
  encoded_audio: string;
  cover?: string;
  isFavorite?: boolean;
}


