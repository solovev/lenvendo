import axios from 'axios';

export default {
  get: async ({ page, searchQuery, sortField, sortDirection, token }) => {
    const params = {
      page: page || 1,
      sort_field: sortField || 'name',
      sort_direction: sortDirection || 'asc',
    };

    if (searchQuery) {
      params['search'] = searchQuery;
    }

    const response = await axios.get('/api/js-test-task', {
      params,
      cancelToken: token,
    });

    const { data } = response;
    const total = data['total_count'];
    const currentPage = data['current_page'];
    const products = data['products'];

    const count = Math.max(products.length, 10);
    const numberOfPages = Math.ceil(total / count);

    return {
      currentPage,
      numberOfPages,
      products,
    };
  },
};
