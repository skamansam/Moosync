const webpack = require('webpack');

module.exports = {
  runtimeCompiler: true,
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.browser': 'true'
      }),
    ],
    externals: ['better-sqlite3']
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: false,
      disableMainProcessTypescript: false,
      mainProcessTypeChecking: true,
      preload: 'src/preload.ts',
      externals: [
        'better-sqlite3'
      ]
    },
    autoRouting: {
      chunkNamePrefix: 'page-'
    }
  },
}
