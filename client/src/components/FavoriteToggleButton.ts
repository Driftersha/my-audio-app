import { el, svg } from 'redom';

interface FavoriteToggleButtonOptions {
  isFavorite: boolean;
  onToggle: () => void;
}

export class FavoriteToggleButton {
  el: HTMLElement;
  private isFavorite: boolean;
  private onToggle: () => void;
  private icon: SVGElement;

  constructor({ isFavorite, onToggle }: FavoriteToggleButtonOptions) {
    this.isFavorite = isFavorite;
    this.onToggle = onToggle;

    this.icon = svg(
      'svg.btn__favorites-icon',
      {
        width: 24,
        height: 24,
        'aria-hidden': 'true',
      },
      svg('use', {
        href: '/assets/img/sprite.svg#icon-favorites',
      })
    );

    this.el = el(
      'button.btn btn--favorites',
      {
        'aria-label': this.getAriaLabel(),
        onclick: (e: MouseEvent) => {
          e.stopPropagation();
          this.onToggle();
        },
      },
      this.icon
    );

    this.updateClass();
  }

  setState(isFavorite: boolean) {
    this.isFavorite = isFavorite;
    this.updateClass();
  }

  private getAriaLabel() {
    return this.isFavorite ? 'Удалить из избранного' : 'Добавить в избранное';
  }

  private updateClass() {
    this.el.classList.toggle('active', this.isFavorite);
    this.el.setAttribute('aria-label', this.getAriaLabel());
  }
}




