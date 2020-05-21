/**
 * Добавляет или удаляет класс 'hidden' элементу.
 *
 * @param {HTMLElement} element - Элемент, которому переключается класс.
 * @param {boolean} value - Если 'true', класс 'hidden' будет добавлен, 'false' - удален.
 */
export const hideElement = (element, value) => {
  const name = 'hidden';
  toggleClass({ element, name, value });
};

/**
 * Добавляет или удаляет указанный класс элементу.
 *
 * @param {object} options - Параметры.
 * @param {HTMLElement} options.element - Элемент, которому переключается класс.
 * @param {string} options.name - Имя класса.
 * @param {boolean} options.value - Если 'true', класс будет добавлен, 'false' - удален.
 */
export const toggleClass = ({ element, name, value }) => {
  const { classList } = element;
  value ? classList.add(name) : classList.remove(name);
};

/**
 * Добавляет элементу, у которого есть атрибут 'data-value', класс 'selected'.
 * Остальным элементам (на данном уровне вложенности) снимает.
 *
 * @param {HTMLElement} element - Элемент, которому будет добавлен класс 'selected'.
 * @returns {boolean} - Возвращает флаг наличия класса 'selected' до его изменения.
 */
export const toggleElementSelection = (target) => {
  const isSelected = target.classList.contains('selected');
  if (!isSelected) {
    const value = target.getAttribute('data-value');
    const other = target.parentElement.querySelectorAll(
      `:not([data-value="${value}"])`
    );
    Array.prototype.forEach.call(other, (element) => {
      element.classList.remove('selected');
    });
    target.classList.add('selected');
  }
  return isSelected;
};

/**
 * Создает HTML элемент.
 *
 * @param {string} tag - Тэг элемента.
 * @param {Object} attrs - Атрибуты элемента.
 * @param {...HTMLElement} children - Потомки созданного элемента.
 * @returns {HTMLElement} - Возвращает новый созданный элемент.
 */
export const createElement = (tag, attrs, ...children) => {
  const element = document.createElement(tag);

  if (attrs) {
    Object.keys(attrs).forEach((key) => {
      const value = attrs[key];
      switch (key) {
        case 'style': {
          Object.keys(value).forEach((style) => {
            element.style[style] = value[style];
          });
          break;
        }
        case 'class': {
          let className = value;
          if (typeof className !== 'string') {
            className = Object.keys(className)
              .filter((key) => className[key])
              .join(' ');
          }
          element.setAttribute(key, className);
          break;
        }
        default: {
          element.setAttribute(key, value);
          break;
        }
      }
    });
  }

  children &&
    children.forEach((child) => {
      if (!child) return;

      child = child instanceof Node ? child : document.createTextNode(child);
      element.appendChild(child);
    });

  return element;
};

/**
 * Обрамляет часть текста в span код HTML, если она равна строке поиска.
 *
 * @param {string} value - Текст.
 * @param {string} filter - Строка поиска.
 * @returns {string} - HTML код.
 */
export const highlightMatches = (value, filter) => {
  const text = value;

  value = (value || '').toLowerCase();
  filter = (filter || '').toLowerCase();

  const start = value.indexOf(filter);
  if (filter.length > 0 && start >= 0) {
    const end = start + filter.length - 1;

    const escape = (s) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const beforeMatch = escape(text.slice(0, start));
    const matchText = escape(text.slice(start, end + 1));
    const afterMatch = escape(text.slice(end + 1));
    return `${beforeMatch}<span class="highlighted">${matchText}</span>${afterMatch}`;
  }
  return text;
};
