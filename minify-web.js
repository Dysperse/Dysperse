/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const minify = require('html-minifier').minify;

const file = fs.readFileSync('./public/index.html', 'utf8');
const f2 = fs.readFileSync('./public/web.css', 'utf8');

const result = minify(file, {
    removeAttributeQuotes: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    sortClassName: true,
    useShortDoctype: true,
    collapseWhitespace: true,
});

const result2 = minify(f2, {
    removeAttributeQuotes: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    sortClassName: true,
    useShortDoctype: true,
    collapseWhitespace: true,
});

fs.writeFileSync('./public/index.html', result);
fs.writeFileSync('./public/web.css', result2);