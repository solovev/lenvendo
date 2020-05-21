import store from '@/store';
import { toggleElementSelection } from '@/view/utils';

export default class SearchBar {
  constructor() {
    const searchBar = document.getElementById('search-bar');
    this.inputElement = searchBar.querySelector('input');
    this.sortToggle = searchBar.querySelector('.sort-controls');
    this.viewToggle = searchBar.querySelector('.mode-controls');
  }

  init() {
    this.inputElement.addEventListener('input', this._handleSearchInput);
    this.sortToggle.addEventListener('click', this._handleSortToggleClick);
    this.viewToggle.addEventListener('click', this._handleViewToggleClick);
  }

  dispose() {
    this.inputElement.removeEventListener('input', this._handleSearchInput);
    this.sortToggle.removeEventListener('click', this._handleSortToggleClick);
    this.viewToggle.removeEventListener('click', this._handleViewToggleClick);
  }

  _handleSearchInput(e) {
    const { target } = e;
    store.setSearchData({ searchQuery: target.value });
  }

  _handleSortToggleClick(e) {
    const { target } = e;
    const sortField = target.getAttribute('data-value');
    if (!sortField) return;

    let sortDirection;

    const isSelected = toggleElementSelection(target);
    if (isSelected) {
      const value = target.classList.toggle('desc');
      sortDirection = value ? 'desc' : 'asc';
    } else {
      target.classList.remove('desc');
    }
    store.setSearchData({ sortField, sortDirection });
  }

  _handleViewToggleClick(e) {
    const { target } = e;
    const value = target.getAttribute('data-value');
    if (!value) return;

    toggleElementSelection(target);
    store.setDisplayMode(value);
  }
}
