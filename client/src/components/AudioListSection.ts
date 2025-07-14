import { el, svg } from 'redom';
import type { Track } from '../types/track';
import { FavoritesStore } from '../store/FavoritesStore';
import { FavoriteToggleButton } from './FavoriteToggleButton';
import placeholderImage from '../assets/img/placeholder.png';
import { timeAgo } from '../utils/timeAgo';

function resolveCover(cover: string | undefined): string {
  if (!cover) return placeholderImage;
  const isFilename = !cover.startsWith('http') && !cover.includes('/');
  return isFilename ? `/img/${cover}` : cover;
}


export class AudioListSection {
  el: HTMLElement;
  private tracks: Track[] = [];
  private listEl: HTMLElement;

  constructor(
    private onSelect: (track: Track) => void,
    private favoritesStore: FavoritesStore
  ) {
    this.el = el('section.audio-list');

    const title = el('h1.audio-list__header-title', 'Аудиофайлы и треки');

    const header = el('.audio-list__header',
      el('span.audio-list__header-cell', '№'),
      el('span.audio-list__header-cell', 'Название'),
      el('span.audio-list__header-cell', 'Альбом'),
      el('.audio-list__header-cell',
        svg('svg.icon', { width: 16, height: 16, 'aria-hidden': 'true' },
          svg('use', { href: '/assets/img/sprite.svg#icon-calendar' })
        )
      ),
      el('.audio-list__header-cell',
        svg('svg.icon', { width: 16, height: 16, 'aria-hidden': 'true' },
          svg('use', { href: '/assets/img/sprite.svg#icon-clock' })
        )
      )
    );


    this.listEl = el('ul.audio-list__list');

    const content = el('div.audio-list__wrapper', [
      title,
      header,
      this.listEl,
    ]);

    const container = el('div.container container--main', content);

    this.el.append(container);
  }


  setTracks(tracks: Track[]) {
    this.tracks = tracks;
    this.render();
  }

  updateFavorites(favoriteIds: Set<number>) {
    this.tracks = this.tracks.map(track => ({
      ...track,
      isFavorite: favoriteIds.has(Number(track.id)),
    }));
    this.render();
  }

  getTracks(): Track[] {
    return this.tracks;
  }

  private render() {
    this.listEl.innerHTML = '';

    if (!this.tracks.length) {
      this.listEl.append(el('p.audio-list__empty', 'Нет треков для отображения.'));
      return;
    }

    this.tracks.forEach((track, index) => {
      const coverSrc = resolveCover(track.cover);

      const favButton = new FavoriteToggleButton({
        isFavorite: track.isFavorite ?? false,
        onToggle: () => {
          this.favoritesStore.toggleFavorite(track.id);
        }
      });

      const dateEl = el('.audio-list__date', '');

      const menuBtn = svg('svg.audio-list__menu-icon', { width: 23, height: 4, 'aria-hidden': 'true' },
        svg('use', { href: '/assets/img/sprite.svg#icon-track-menu' })
      );

      const menuToggleBtn = el('button.audio-list__menu-btn btn', { 'aria-label': 'Открыть меню', type: 'button' }, menuBtn);

      const menuEl = el('.audio-list__menu.audio-list__menu--hidden',
        el('ul.audio-list__menu-list',
          ...['Нравится', 'Не нравится'].map(text => {
            const item = el('li.audio-list__menu-item', text);
            item.onclick = (e) => {
              e.stopPropagation();
              menuEl.querySelectorAll('.audio-list__menu-item')
                .forEach(el => el.classList.remove('audio-list__menu-item--active'));
              item.classList.add('audio-list__menu-item--active');
              menuEl.classList.add('audio-list__menu--hidden');
              console.log('Действие:', text);
            };
            return item;
          })
        )
      );

      menuToggleBtn.onclick = (e) => {
        e.stopPropagation();
        menuEl.classList.toggle('audio-list__menu--hidden');
      };

      const li = el('li.audio-list__item',
        {
          tabindex: 0,
          onclick: () => {
            menuEl.classList.add('audio-list__menu--hidden');
            this.onSelect(track);
          },
          onkeydown: (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              menuEl.classList.add('audio-list__menu--hidden');
              this.onSelect(track);
            }
          }
        },
        el('.audio-list__index', `${index + 1}`),
        el('.audio-list__track',
          el('img.audio-list__cover', {
            src: coverSrc,
            alt: track.title,
            width: 60,
            height: 60,
            onerror: (e: Event) => {
              (e.target as HTMLImageElement).src = placeholderImage;
            }
          }),
          el('.audio-list__info',
            el('span.audio-list__title', track.title),
            el('span.audio-list__artist', track.artist || '—')
          )
        ),
        el('.audio-list__album', track.album || '—'),
        dateEl,
        favButton.el,
        el('.audio-list__duration', track.duration ? `${track.duration.toFixed(2)}` : '—'),
        menuToggleBtn,
        menuEl
      );

      const updateFavorite = () => {
        const isFavorite = this.favoritesStore.isFavorite(track.id);
        favButton.setState(isFavorite);

        const date = this.favoritesStore.getDate(track.id);
        dateEl.textContent = isFavorite && date ? timeAgo(date) : '';
      };

      updateFavorite();
      this.favoritesStore.subscribe(updateFavorite);

      this.listEl.append(li);
    });

  }
}



