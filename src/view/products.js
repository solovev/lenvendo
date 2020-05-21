import store from '@/store';
import PageNav from '@/view/page-nav';
import { createElement, toggleClass } from '@/view/utils';
import { highlightMatches } from './utils';

export default class Products {
  constructor() {
    this.element = document.getElementById('products');

    this.list = this.element.querySelector('.list');
    this.topNav = new PageNav({ id: 'page-nav-top' });
    this.bottomNav = new PageNav({ id: 'page-nav-bottom' });
  }

  init() {
    this.topNav.init();
    this.bottomNav.init();

    this.rebuild = this._rebuild.bind(this);
    store.addEventListener('onProductDataChanged', this.rebuild);
    store.addEventListener('onDisplayModeChanged', this.rebuild);

    this.handleLoadingChanged = this._handleLoadingChanged.bind(this);
    store.addEventListener('onLoadingStateChanged', this.handleLoadingChanged);
  }

  dispose() {
    this.topNav.dispose();
    this.bottomNav.dispose();

    store.removeEventListener(
      'onLoadingStateChanged',
      this.handleLoadingChanged
    );
    store.removeEventListener('onProductDataChanged', this.rebuild);
    store.removeEventListener('onDisplayModeChanged', this.rebuild);
  }

  _handleLoadingChanged(value) {
    toggleClass({ element: this.element, name: 'loading', value });
  }

  _rebuild() {
    this.list.innerHTML = '';

    let { products, displayMode } = store.state;
    products = products || [];

    let child;
    switch (displayMode) {
      case 'tile':
        child = this._buildTile(products);
        break;
      case 'table':
        child = this._buildTable(products);
        break;
      default:
        child = this._buildList(products);
        break;
    }

    if (child) {
      this.list.setAttribute('data-type', displayMode);
      this.list.appendChild(child);
    }
  }

  _buildList(products, forTile) {
    const fragment = document.createDocumentFragment();
    products.forEach((product) => {
      const element = this._buildProductItem(product, { forTile });
      fragment.appendChild(element);
    });
    return fragment;
  }

  _buildTile(products) {
    const fragment = document.createDocumentFragment();

    const count = products.length;
    const chunk = 3;
    for (let i = 0; i < count; i += chunk) {
      const chunkArray = products.slice(i, i + chunk);
      const list = this._buildList(chunkArray, true);
      const element = createElement(
        'div',
        { class: 'row row--center tile-list' },
        list
      );
      fragment.appendChild(element);
    }
    return fragment;
  }

  _buildTable(products) {
    const fragment = document.createDocumentFragment();

    const headerRow = createElement(
      'tr',
      null,
      createElement('th', null, 'Image'),
      createElement('th', null, 'Item name'),
      createElement('th', null, 'Price (₽)')
    );
    fragment.appendChild(headerRow);

    products.forEach((product) => {
      const imageElement = this._buildProductImage(product.image);
      const imageCell = createElement('td', null, imageElement);
      const nameCell = createElement('td', null, this._buildProductName(product.name));
      const priceCell = createElement('td', null, product.price);
      const tr = createElement('tr', null, imageCell, nameCell, priceCell);
      fragment.appendChild(tr);
    });
    return createElement('table', { class: 'tile' }, fragment);
  }

  _buildProductItem(product, { forTile }) {
    const image = this._buildProductImage(product.image);

    const name = createElement(
      'div',
      { class: 'ellipsis item-shrink list-item__name' },
      this._buildProductName(product.name)
    );

    const price = createElement(
      'div',
      {
        class: 'list-item__price',
        'data-label': 'Price:',
        'data-currency': '₽',
      },
      product.price
    );

    const data = createElement(
      'div',
      {
        class: `column ${forTile ? 'column--center' : ''} list-item__data`,
      },
      name,
      price
    );

    const element = createElement(
      'div',
      { class: `${forTile ? 'column column--center' : 'row'} tile list-item` },
      image,
      data
    );
    return element;
  }

  _buildProductImage(image) {
    return createElement('div', {
      class: 'image item-solid',
      style: { 'background-image': `url(${image})` },
    });
  }

  _buildProductName(name) {
    const { searchQuery } = store.state;
    const element = createElement('span', null);
    element.innerHTML = highlightMatches(name, searchQuery);
    return element;
  }
}
