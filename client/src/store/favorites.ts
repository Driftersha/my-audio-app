
import { FavoritesStore } from './FavoritesStore';
const token = localStorage.getItem('token') ?? '';
export const favoritesStore = new FavoritesStore(token);


