module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // Use the new worklets plugin instead of the deprecated reanimated plugin
      "react-native-worklets/plugin",
    ],
  };
};