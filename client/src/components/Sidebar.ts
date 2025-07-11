import { el, svg } from 'redom';

export class Sidebar {
  el: HTMLElement;
  private navItems: HTMLAnchorElement[] = [];

  constructor() {

    const logoIcon = svg(
      'svg.sidebar__logo-icon',
      {
        width: 184,
        height: 30,
        'aria-hidden': 'true',
      },
      svg('use', { href: '/assets/img/sprite.svg#icon-logo' })
    );

    const logo = el('div.sidebar__logo', logoIcon);

    const items = [
      { label: 'Избранное', href: '#/favorites' },
      { label: 'Аудиокомпозиции', href: '#/tracks' },
    ];

    this.navItems = items.map(({ label, href }) => {
      const isActive = window.location.hash === href;

      const icon = svg(
        'svg.sidebar__item-icon',
        {
          width: 32,
          height: 32,
          'aria-hidden': 'true',
        },
        svg('use', {
          href: '/assets/img/sprite.svg#icon-music',
        })
      );

      const mobileIcon =
        label === 'Аудиокомпозиции'
          ? svg(
            'svg.sidebar__icon-mobile',
            {
              width: 24,
              height: 24,
              'aria-hidden': 'true',
            },
            svg('use', {
              href: '/assets/img/sprite.svg#icon-play-sidebar',
            })
          )
          : null;

      const text = el('span.sidebar__item-label', label);

      const children = mobileIcon
        ? [icon, mobileIcon, text]
        : [icon, text];

      const link = el(
        'a.sidebar__item',
        { href },
        ...children
      ) as HTMLAnchorElement;

      if (isActive) {
        link.classList.add('sidebar__item--active');
      }

      return link;
    });



    const nav = el('nav.sidebar__menu', this.navItems);

    this.el = el('aside.sidebar', [logo, nav]);

    window.addEventListener('hashchange', () => this.updateActive());
  }

  private updateActive() {
    const current = window.location.hash;
    this.navItems.forEach((item) => {
      const isActive = item.getAttribute('href') === current;
      item.classList.toggle('sidebar__item--active', isActive);
    });
  }
}






