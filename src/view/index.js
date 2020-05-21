import store from '@/store';
import { hideElement } from '@/view/utils';
import SearchBar from '@/view/search-bar';
import Products from '@/view/products';

class View {
  constructor() {
    this.loadingElement = document.getElementById('loader');
    this.messageElement = document.getElementById('message');

    this.searchBar = new SearchBar();
    this.products = new Products();
  }

  init() {
    this.searchBar.init();
    this.products.init();

    this.handleLoadingChanged = this._handleLoadingChanged.bind(this);
    store.addEventListener('onLoadingStateChanged', this.handleLoadingChanged);
  }

  dispose() {
    this.searchBar.dispose();
    this.products.dispose();

    store.removeEventListener(
      'onLoadingStateChanged',
      this.handleLoadingChanged
    );
  }

  _handleLoadingChanged(value, errorCode) {
    hideElement(this.loadingElement, !value);
    hideElement(this.messageElement, !errorCode);
    hideElement(this.products.element, errorCode);

    if (errorCode) {
      let message;
      switch (errorCode) {
        case 404:
          message = `Sorry, no results for: ${store.state.searchQuery}`;
          break;
        default:
          message = `Oops! Unknown error`;
          break;
      }
      this.messageElement.innerText = message;
    }
  }
}

export default new View();
