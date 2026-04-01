const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// 🚀 Optimisations de performance
config.transformer = {
  ...config.transformer,
  // Optimisation pour les transformations JSX
  minifierConfig: {
    compress: {
      passes: 3,
      pure_getters: true,
      sequences: 30,
      unused: true,
    },
    mangle: {
      safari10: true,
    },
  },
};

// Activer le caching agressif
config.projectRoot = __dirname;
config.watchFolders = [
  __dirname,
  // Ajouter node_modules pour le watch
];

// Optimiser les résolutions de modules
config.resolver.sourceExts.push("cjs");

module.exports = config;
