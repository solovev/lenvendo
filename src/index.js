import '@/styles/index.scss';

import navigation from '@/navigation';
import store from '@/store';
import view from '@/view';

view.init();

const pageRoute = '/page/:id';
const homeRoute = '/';

export const getURL = (page) => pageRoute.replace(':id', page);

export const setURL = (page) => {
  const url = getURL(page);
  navigation.setState(url, { replace: true });
};

export const navigateToPage = (page) => {
  setURL(page);
  store.fetchData(page);
  console.log(`Navigate to page #${page}`);
};

navigation.listen({
  [pageRoute]: ({ id }) => {
    navigateToPage(+id);
  },
  [homeRoute]: () => {
    navigateToPage(1);
  },
});
