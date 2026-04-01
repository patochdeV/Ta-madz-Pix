module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { unstable_transformImportMeta: true }]],
    plugins: [
      // Module resolver pour les imports path
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./",
            "@shared": "./shared"
          }
        }
      ],
      // Optimisations de performance
      "@babel/plugin-transform-react-pure-annotations", // Marquer les composants purrets
      "@babel/plugin-transform-react-constant-elements",  // Constantes React
      "transform-inline-environment-variables", // Inliner les variables d'env
      [
        "babel-plugin-transform-remove-console", // Enlever les console.logs
        { exclude: ["error", "warn"] }
      ],
      // React optimisations
      "react-native-reanimated/plugin", // Pour Reanimated
    ],
    env: {
      development: {
        plugins: [
          [
            "babel-plugin-transform-inline-environment-variables",
            {
              include: ["EXPO_OS"]
            }
          ]
        ]
      }
    }
  };
};
