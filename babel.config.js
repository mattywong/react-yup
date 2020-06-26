const defaultConfig = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          browsers: "last 2 versions, ie 10-11",
        },
        modules: false,
      },
    ],
    "@babel/preset-react",
    "@babel/preset-typescript",
  ],
};

module.exports = (api) => {
  const isTestEnv = api.env("test");

  if (isTestEnv) {
    return {
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {
              node: true,
            },
            modules: false,
          },
        ],
        "@babel/preset-react",
        "@babel/preset-typescript",
      ],
      plugins: ["@babel/plugin-transform-modules-commonjs"],
    };
  }

  return defaultConfig;
};
