import store from '@/store';
import { createElement, hideElement } from '@/view/utils';
import MatchMediaListener from '@/view/utils/match-media-listener';
import { navigateToPage } from '@';
import { getURL } from '..';

export default class PageNav {
  constructor(id) {
    this.element = document.getElementById(id);

    this.jumpStartLabel = '‹';
    this.jumpEndLabel = '›';
    this.maxButtonCount = 9;
  }

  init() {
    this.redraw = this._redraw.bind(this);

    this.mediaListener = new MatchMediaListener({
      query: 'min-width: 1280px',
      callback: (isMatch) => {
        this.maxButtonCount = isMatch ? 9 : 5;
        this.redraw(store.state);
      },
    });
    this.mediaListener.init();

    store.addEventListener('onProductDataChanged', this.redraw);

    this.handleClick = this._handleClick.bind(this);
    this.element.addEventListener('click', this.handleClick);
  }

  dispose() {
    store.removeEventListener('onProductDataChanged', this.redraw);
    this.element.removeEventListener('click', this.handleClick);

    this.mediaListener.dispose();
  }

  _handleClick(e) {
    e.preventDefault();

    const { target } = e;
    const value = target.getAttribute('data-value');
    if (!value) return;

    let page;
    switch (value) {
      case this.jumpStartLabel:
        page = 1;
        break;
      case this.jumpEndLabel:
        const { numberOfPages } = store.state;
        page = numberOfPages;
        break;
      default:
        page = +value;
        break;
    }

    !isNaN(page) && navigateToPage(page);
  }

  _redraw({ currentPage, numberOfPages }) {
    this.element.innerHTML = '';

    const pageLabels = this._createLabels({ currentPage, numberOfPages });
    if (pageLabels.length <= 0) return;

    hideElement(this.element, false);

    const firstButtonLabel = pageLabels[0];
    if (firstButtonLabel != 1) {
      pageLabels.unshift(this.jumpStartLabel);
    }

    const lastButtonLabel = pageLabels[pageLabels.length - 1];
    if (lastButtonLabel != numberOfPages) {
      pageLabels.push(this.jumpEndLabel);
    }

    const fragment = document.createDocumentFragment();
    pageLabels.forEach((label) => {
      const element = this._createButtonElement(label, currentPage);
      fragment.append(element);
    });
    this.element.appendChild(fragment);
  }

  _createButtonElement(label, currentPage) {
    let page;
    switch (label) {
      case this.jumpStartLabel: {
        page = 1;
        break;
      }
      case this.jumpEndLabel: {
        const { numberOfPages } = store.state;
        page = numberOfPages;
        break;
      }
      default: {
        page = +label;
        break;
      }
    }

    const classData = {
      'button page-nav__item': true,
      'page-nav__item--jump': this._isJumpLabel(label),
      selected: currentPage === page,
    };

    return createElement(
      'a',
      {
        class: classData,
        'data-value': page,
        href: getURL(page),
      },
      label
    );
  }

  _createLabels({ numberOfPages, currentPage }) {
    const count = Math.min(this.maxButtonCount, numberOfPages);
    const half = Math.floor(count / 2);
    const labels = [];
    for (let i = 0; i < count; i++) {
      const prev = labels[i - 1];
      let value = prev ? prev + 1 : Math.max(1, currentPage + i - half);
      if (value > numberOfPages) {
        break;
      }
      labels.push(value);
    }
    if (labels.length < count && count <= numberOfPages) {
      const pad = count - labels.length;
      for (var i = 0; i < pad; i++) {
        labels.unshift(labels[0] - 1);
      }
    }
    return labels;
  }

  _isJumpLabel(label) {
    return label == this.jumpStartLabel || label == this.jumpEndLabel;
  }
}
