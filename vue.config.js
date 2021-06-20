const webpack = require('webpack');
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')
const ThreadsPlugin = require('threads-plugin')
const dotenv = require('dotenv').config({ path: __dirname + '/config.env' });

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
        'process.browser': 'true',
        'process.env.YoutubeClientID': JSON.stringify(dotenv.parsed['YOUTUBECLIENTID']),
        'process.env.SpotifyClientID': JSON.stringify(dotenv.parsed['SPOTIFYCLIENTID']),
        'process.env.SpotifyClientSecret': JSON.stringify(dotenv.parsed['SPOTIFYCLIENTSECRET'])
      }),
      new VuetifyLoaderPlugin(),
    ],
    externals: ['better-sqlite3', 'youtube-music-api'],
    devtool: 'source-map'
  },
  pluginOptions: {
    electronBuilder: {
      mainProcessWatch: ['src/utils/main'],
      customFileProtocol: 'com.moosync://./',
      builderOptions: {
        publish: ['github'],
        asarUnpack: ['*.worker.js'],
      },
      nodeIntegration: false,
      disableMainProcessTypescript: false,
      mainProcessTypeChecking: true,
      preload: 'src/utils/preload/preload.ts',
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
