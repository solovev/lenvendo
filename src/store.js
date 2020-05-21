import { setURL } from '@';
import API from '@/api';
import axios from 'axios';
import debounce from 'lodash.debounce';

const CancelToken = axios.CancelToken;
let source;

/**
 * Класс, описывающий локальное состояние приложения.
 * Все виджеты (классы, располагающиеся в @/view) подписыюватся на изменение этого состояния.
 * Содержит 4 функции, которые изменяют state:
 *  setSearchData, setProductData, setLoadingStatus, setDisplayMode
 * После изменения состояния вызываются события:
 *  onSearchDataChanged, onProductDataChanged, onLoadingStateChanged, onDisplayModeChanged
 */
class Store {
  constructor() {
    this.state = {
      searchQuery: '',
      sortField: 'name', // name/price
      sortDirection: 'asc', // asc/desc

      displayMode: 'list', // list/tile/table

      currentPage: 1,
      numberOfPages: 0,
      products: [],

      loadingKey: '',
      loadingErrorCode: null,
      isLoading: true,
    };
    this.listeners = {
      onSearchDataChanged: [],
      onProductDataChanged: [],
      onLoadingStateChanged: [],
      onDisplayModeChanged: [],
    };
    this.debouncedFetchData = debounce(this.fetchData.bind(this), 300);
  }

  /**
   * Изменяет тип отображения списка товаров.
   * Вызывает событие onDisplayModeChanged
   *
   * @param {string} value - Тип, ожидаемые значения: list | tile | table
   */
  setDisplayMode(value) {
    this.state.displayMode = value;
    this.listeners['onDisplayModeChanged'].forEach((listener) =>
      listener(value)
    );
  }

  /**
   * Изменяет параметры поиска и инициирует HTTP запрос.
   * Вызывает событие onSearchDataChanged.
   *
   * @param {object} options - Параметры.
   * @param {string} options.searchQuery - Значение, по которому происходит поиск товара.
   * @param {string} options.sortField - Поле, по которому происходит сортировка списка, ожидаемые значения: name | price.
   * @param {string} options.sortDirection - Тип сортировки, ожидаемые значения: asc | desc.
   */
  setSearchData({ searchQuery, sortField, sortDirection }) {
    const value = {
      searchQuery:
        searchQuery === undefined ? this.state.searchQuery : searchQuery,
      sortField: sortField || this.state.sortField,
      sortDirection: sortDirection || this.state.sortDirection,
    };
    Object.assign(this.state, value);
    this.debouncedFetchData(1);

    this.listeners['onSearchDataChanged'].forEach((listener) =>
      listener(value)
    );
  }

  /**
   * Сохраняет страницу со списоком товаров.
   * Вызывает событие onProductDataChanged.
   *
   * @param {object} options - Параметры.
   * @param {number} options.currentPage - Номер текущей страницы с товарами.
   * @param {number} options.numberOfPages - Общее кол-во страниц.
   * @param {Object[]} options.products - Список товаров на странице.
   */
  setProductData({ currentPage, numberOfPages, products }) {
    const value = { currentPage, numberOfPages, products };
    Object.assign(this.state, value);
    this.listeners['onProductDataChanged'].forEach((listener) =>
      listener(value)
    );
    setURL(+currentPage);
  }

  /**
   * Изменяет состояние выполнения HTTP запроса.
   * Вызывает событие onLoadingStateChanged.
   *
   * @param {string} key - Идентификатор запроса (все query-параметры).
   * @param {boolean} value - Значение, показывающее, выполняется запрос или нет.
   * @param {number} errorCode - Код ошибки, если есть.
   */
  setLoadingStatus(key, value, errorCode) {
    Object.assign(this.state, {
      loadingKey: key,
      isLoading: value,
      loadingErrorCode: errorCode,
    });

    this.listeners['onLoadingStateChanged'].forEach((listener) =>
      listener(value, errorCode)
    );
  }

  /**
   * Добавляет слушатель события.
   * 
   * @param {string} event - Событие, ожидаемые значения: onSearchDataChanged | onProductDataChanged | onLoadingStateChanged | onDisplayModeChanged
   * @param {function} callback - Слушатель (колбэк).
   */
  addEventListener(event, callback) {
    this.listeners[event].push(callback);
  }

  /**
   * Удаляет слушатель события.
   * 
   * @param {string} event - Событие, ожидаемые значения: onSearchDataChanged | onProductDataChanged | onLoadingStateChanged | onDisplayModeChanged
   * @param {function} callback - Слушатель (колбэк).
   */
  removeEventListener(event, callback) {
    const listeners = this.listeners[event];
    const index = listeners.indexOf(callback);
    index >= 0 && listeners.splice(index, 1);
  }

  /**
   * Осуществляет HTTP запрос.
   * 
   * @param {number} page - Указанная страница.
   */
  async fetchData(page) {
    const params = {
      page: page || this.state.currentPage,
      searchQuery: this.state.searchQuery,
      sortField: this.state.sortField,
      sortDirection: this.state.sortDirection,
    };

    const loadingKey = JSON.stringify(params);
    this.setLoadingStatus(loadingKey, true);

    source && source.cancel('New request initiated');
    source = CancelToken.source();

    let errorCode = null;
    try {
      const data = await API.get({
        token: source.token,
        ...params,
      });
      this.setProductData(data);
    } catch (e) {
      if (axios.isCancel(e)) {
        console.log('[Request canceled]', e.message);
      } else {
        console.error(e);
        errorCode = (e.response || {}).status || -1;
      }
    }

    if (this.state.loadingKey === loadingKey) {
      this.setLoadingStatus(loadingKey, false, errorCode);
    }
  }
}

export default new Store();
