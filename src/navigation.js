class Navigation {
  /**
   * Начинает слушать изменения URL в адресной строке.
   * 
   * @param {Object} routes - key - URL путь, value - колбэк, который сработает по переходу по этому URL'y
   */
  listen(routes) {
    this.routes = routes || {};

    const handler = this._handlePopState.bind(this);
    window.addEventListener('popstate', handler);

    handler();
  }

  /**
   * Проверяет совпадение адреса и одного из переданных маршрутов.
   * Берет из маршрута параметр (:var), если таковой имеется, и передает его в callback.
   */
  _handlePopState() {
    const url = location.pathname;

    let argumentName;
    let argumentValue;

    const route = Object.keys(this.routes).find((route) => {
      argumentName = argumentValue = '';

      const argumentIndex = route.indexOf(':');
      if (argumentIndex >= 0) {
        argumentName = route.substring(argumentIndex + 1);
        route = route.substring(0, argumentIndex);
      }

      if (url.indexOf(route) === 0) {
        argumentValue = url.substring(route.length);
        return true;
      }
    });

    const callback = this.routes[route];
    if (typeof callback === 'function') {
      callback({ url, [argumentName]: argumentValue });
    }
  }

  /**
   * Добавляет (или изменяет) состояние в истории переходов.
   * 
   * @param {string} url - Новый URL.
   * @param {object} options - Дополнительные параметры.
   * @param {boolean} options.replace - Если значение равно 'true', новое состояние заменит собой последнее.
   */
  setState(url, options) {
    url = url || '';
    options = options || {};

    if (options.replace) {
      history.replaceState({}, '', url);
    } else {
      history.pushState({}, '', url);
    }
  }
}

export default new Navigation();
