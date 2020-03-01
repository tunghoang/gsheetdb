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
  ],
  compact: true,
  minified: true,
  comments: false,
}
