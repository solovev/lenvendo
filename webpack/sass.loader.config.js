const Path = require('path');

const stylesDir = 'styles';

module.exports = {
  loader: 'sass-loader',
  options: {
    prependData: `
          @import "@/${stylesDir}/_variables.scss";
          @import "@/${stylesDir}/_mixins.scss";
        `,
    sassOptions: {
      includePaths: [
        Path.resolve(__dirname, '..', 'src', stylesDir),
        Path.resolve(__dirname, '..', 'node_modules', 'normalize-scss', 'sass'),
      ],
    },
  },
};
