module.exports = api => ({
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
  compact: api.env("production"),
  minified: api.env("production"),
  comments: false,
}
)
