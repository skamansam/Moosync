'use strict'

import 'threads/register';

import { BrowserWindow, app, nativeTheme, protocol, session } from 'electron';
import { WindowHandler, setIsQuitting } from './utils/main/windowManager';
import path, { resolve } from 'path';

import EventEmitter from 'events';
import { OAuthHandler } from '@/utils/main/oauth/handler';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import { extensionHost } from '@/utils/extensions';
import log from 'loglevel'
import { prefixLogger } from './utils/main/logger';
import { registerIpcChannels } from '@/utils/main/ipc'; // Import for side effects
import { setInitialInterfaceSettings } from './utils/main/db/preferences';
import { setupScanTask } from '@/utils/main/scheduler/index';

overrideConsole()

const isDevelopment = process.env.NODE_ENV !== 'production'
export const oauthHandler = new OAuthHandler()
export const oauthEventEmitter = new EventEmitter()
export const _windowHandler = new WindowHandler()

nativeTheme.themeSource = 'dark'


// Since in development mode, it is valid to have multiple processes open,
// Quit the app if it is supposed to be launched for oauth
// The argv/s will be passed to the original instance
if (isDevelopment && process.argv.findIndex((arg) => arg.startsWith('com.moosync')) !== -1) {
  app.quit()
}

if (!app.requestSingleInstanceLock()) {
  if (!isDevelopment)
    app.quit()
}

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'com.moosync', privileges: { secure: true, standard: true } }])
protocol.registerSchemesAsPrivileged([{ scheme: 'media', privileges: { corsEnabled: true, supportFetchAPI: true } }])

function interceptHttp() {
  // Youtube images don't have a CORS header set [Access-Control-Allow-Origin]
  // So to display them and export them, we spoof the request here
  // This should pose any security risk as such since we're only doing it for youtube trusted urls
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    let headers: { [key: string]: string | string[] } = { ...details.responseHeaders }

    if (details.url.startsWith('https://i.ytimg.com')) {
      headers = {
        'Access-Control-Allow-Origin': '*'
      }
    }

    callback({
      responseHeaders: headers
    })
  })

  // Since youtube embeds are blocked on custom protocols like file:// or app://
  // We'll load the app on http://localhost
  // Which will then be intercepted here and normal files will be delivered
  // Essentially spoofing window.location.origin to become http://localhost
  if (!process.env.WEBPACK_DEV_SERVER_URL) {
    session.defaultSession.protocol.interceptFileProtocol('http', (request, callback) => {
      let pathName = new URL(request.url).pathname
      pathName = decodeURI(pathName)

      const filePath = path.join(__dirname, pathName)

      // deregister intercept after we handle index.js
      if (request.url.includes('index.js')) {
        session.defaultSession.protocol.uninterceptProtocol('http')
      }

      try {
        callback(filePath)
      } catch (e) {
        console.error(e)
      }
    })
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) _windowHandler.createWindow(true)
})

app.on('before-quit', () => {
  setIsQuitting(true)
})


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  registerIpcChannels()
  await setInitialInterfaceSettings()

  await _windowHandler.installExtensions()
  _windowHandler.registerProtocol('media')
  createProtocol('com.moosync')

  interceptHttp()

  await _windowHandler.createWindow(true)
  extensionHost.mainWindowCreated()

  _windowHandler.handleFileOpen()
  setupScanTask()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

app.on('open-url', function (event, data) {
  event.preventDefault()
  oauthHandler.handleEvents(data)
})

if (isDevelopment && process.platform === 'win32') {
  // Set the path of electron.exe and your app.
  // These two additional parameters are only available on windows.
  // Setting this is required to get this working in dev mode.
  app.setAsDefaultProtocolClient('com.moosync', process.execPath, [
    resolve(process.argv[1])
  ])
} else {
  app.setAsDefaultProtocolClient('com.moosync')
}

app.on('second-instance', handleSecondInstance)

function findOAuthArg(argv: string[]) {
  console.log(argv)
  return argv.find((arg) => arg.startsWith('com.moosync'))
}

function handleSecondInstance(_: Event, argv: string[]) {
  if (process.platform !== 'darwin') {
    const arg = findOAuthArg(argv)
    if (arg) {
      oauthHandler.handleEvents(arg)
    } else {
      _windowHandler.handleFileOpen(argv)
    }
  }

  if (!isDevelopment) {
    const window = WindowHandler.getWindow()
    if (window && !window.isFocused()) {
      _windowHandler.destroyTray()
      window.show()
    }
  }
}

function overrideConsole() {
  const child = log.getLogger('Main')
  prefixLogger(app.getPath('logs'), child)
  console.info = (...args: any[]) => {
    child.info(...args)
  }

  console.error = (...args: any[]) => {
    child.error(...args)
  }
}

export function mainWindowHasMounted() {
  _windowHandler.mainWindowHasMounted()
}
