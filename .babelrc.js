module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        "targets": {
          "esmodules": true
        }
      }
    ],
    "minify",
  ],
  compact: true,
  minified: true,
  comments: false,
}
