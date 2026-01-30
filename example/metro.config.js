const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Watch the library source directory
config.watchFolders = [workspaceRoot];

// Resolve modules from both the example and root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Resolve the library from the source directory
config.resolver.extraNodeModules = {
  'react-native-adaptive-bottom-sheet': path.resolve(workspaceRoot, 'src'),
};

// Ensure we don't have duplicate React instances
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
