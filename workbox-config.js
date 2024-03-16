module.exports = {
	globDirectory: 'dist/',
	globPatterns: [
		'**/*.{js,ttf,ico,html,json,css}'
	],
	swDest: 'dist/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};