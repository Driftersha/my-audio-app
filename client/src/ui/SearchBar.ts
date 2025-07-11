import { el, svg } from 'redom';

interface SearchBarOptions {
  onSearch: (query: string) => void;
}

export class SearchBar {
  el: HTMLElement;
  input: HTMLInputElement;
  private searchIcon: SVGAElement;
  private onSearch: (query: string) => void;
  private debounceTimer?: number;

  constructor({ onSearch }: SearchBarOptions) {
    this.onSearch = onSearch;

    this.input = el('input.search-bar__input', {
      type: 'search',
      placeholder: 'Что будем искать?',
      'aria-label': 'Что будем искать?',
      name: 'search',
      autocomplete: 'off',
      oninput: () => this.handleInput(),
    }) as HTMLInputElement;

    this.searchIcon = svg('svg.search-bar__icon',
      {
        width: 24,
        height: 24,
        'aria-hidden': 'true'
      },
      svg('use', {
        'href': '/assets/img/sprite.svg#icon-search'
      })) as SVGAElement;

    this.el = el('div.search-bar', this.input, this.searchIcon);
  }

  private handleInput() {
    const value = this.input.value.trim().toLowerCase();

    clearTimeout(this.debounceTimer);
    this.debounceTimer = window.setTimeout(() => {
      this.onSearch(value);
    }, 300);
  }

  setQuery(value: string) {
    this.input.value = value;
  }
}


