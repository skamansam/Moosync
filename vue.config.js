const webpack = require('webpack');
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')
const ThreadsPlugin = require('threads-plugin')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  runtimeCompiler: true,
  pages: {
    index: {
      entry: 'src/mainWindow/main.ts',
      template: 'public/index.html',
      filename: 'index.html',
    },
    preferenceWindow: {
      entry: 'src/preferenceWindow/main.ts',
      template: 'public/index.html',
      filename: 'preferenceWindow.html',
    }
  },
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.browser': 'true'
      }),
      new VuetifyLoaderPlugin(),
    ],
    externals: ['better-sqlite3', 'youtube-music-api'],
    devtool: 'source-map'
  },
  pluginOptions: {
    electronBuilder: {
      customFileProtocol: 'com.moosync://./',
      builderOptions: {
        publish: ['github'],
        asarUnpack: ['*.worker.js'],

      },
      nodeIntegration: false,
      disableMainProcessTypescript: false,
      mainProcessTypeChecking: true,
      preload: 'src/preload.ts',
      externals: [
        'better-sqlite3'
      ],
      chainWebpackMainProcess: (config) => {
        config.plugin('thread')
          .use(ThreadsPlugin, [{ target: 'electron-node-worker' }]);
      },
    },
    autoRouting: {
      pages: 'src/mainWindow/pages',
      importPrefix: '@/mainWindow/pages/',
      chunkNamePrefix: 'page-'
    }
  },
}
