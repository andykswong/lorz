/** @type {import('@babel/core').ConfigFunction} */
module.exports = api => {
  const isTest = api.env('test');

  /** @type {import('@babel/core').TransformOptions} */
  const config = {
    assumptions: {
      noDocumentAll: true,
      noNewArrows: true,
      objectRestNoSymbols: true,
      privateFieldsAsProperties: true,
      setPublicClassFields: true,
      setSpreadProperties: true,
    },
    presets: [
      ['@babel/preset-env', { modules: false, targets: { node: true } }],
      ['@babel/preset-typescript']
    ],
    plugins: [],
    ignore: [
      'node_modules'
    ],
    comments: false,
    minified: !isTest
  };

  return config;
};
