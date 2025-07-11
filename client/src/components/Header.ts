import { el, svg } from 'redom';
import { SearchBar } from '../ui/SearchBar';
import defaultAvatar from '../assets/img/avatar.png';

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('avatar');
  location.reload();
}

interface HeaderOptions {
  onSearch: (query: string) => void;
}

export class Header {
  el: HTMLElement;
  public searchBar: SearchBar;

  constructor({ onSearch }: HeaderOptions) {
    this.searchBar = new SearchBar({ onSearch });

    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username') || 'Пользователь';
    const avatar = localStorage.getItem('avatar') || defaultAvatar;


    const logoIcon = svg(
      'svg.header__logo-icon',
      {
        width: 178,
        height: 30,
        'aria-hidden': 'true',
      },
      svg('use', { href: '/assets/img/sprite.svg#icon-logo' })
    );

    const logo = el('div.header__logo', logoIcon);


    const avatarImg = el('img.header_avatar', {
      src: avatar,
      alt: `${username} avatar`,
      width: 42,
      height: 42,
    });

    const nameSpan = el('span.header_name', username);

    const iconArrow = svg(
      'svg.header_icon',
      {
        width: 16,
        height: 16,
        'aria-hidden': 'true',
      },
      svg('use', {
        href: '/assets/img/sprite.svg#icon-arrow',
      })
    );

    const btnMenu = el(
      'button.header_user-btn.btn',
      { 'aria-label': 'Открыть меню пользователя' },
      iconArrow
    );

    const profileBtn = el(
      '.header_info',
      [avatarImg, nameSpan, btnMenu]
    );

    const dropdown = el(
      '.header_user-dropdown.header_user-dropdown--hidden',
      el('button.header_logout-btn.btn.btn--logout', { onclick: logout }, 'Выйти')
    );

    profileBtn.onclick = (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('header_user-dropdown--hidden');
    };

    document.addEventListener('click', (e) => {
      if (!(e.target as HTMLElement).closest('.header_user')) {
        dropdown.classList.add('header_user-dropdown--hidden');
      }
    });

    const userWrapper = el('div.header_user', [profileBtn, dropdown]);


    const wrapper = el(
      'div.header__wrapper',
      [
        logo,
        this.searchBar.el,
        userWrapper
      ]
    );

    const container = el('div.container.container--header', wrapper);

    this.el = el('header.header', container);
  }
}








