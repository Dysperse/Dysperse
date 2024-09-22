import fs from 'fs';
import { minify } from 'html-minifier';
const file = fs.readFileSync('./public/index.html', 'utf8');
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

fs.writeFileSync('./public/index.html', result);