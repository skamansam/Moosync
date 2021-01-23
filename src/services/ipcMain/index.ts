import { ipcMain } from 'electron'
import { MusicScanner } from '../files/scanner'
import { MiniSongDbInstance, PathsDBInstance, SongDBInstance } from '../db/index'

ipcMain.on('scanMusic', async function (event: Electron.IpcMainEvent, args: string[]) {
  const scanner = new MusicScanner(...args)
  scanner.start()
})

ipcMain.on('getAllSongs', async function (event: Electron.IpcMainEvent) {
  const dbInstance = new MiniSongDbInstance()
  dbInstance.getAll().then((data) => event.reply('gotSongs', data))
})

ipcMain.on('getSingleSong', async function (event: Electron.IpcMainEvent, args) {
  const dbInstance = new SongDBInstance()
  dbInstance.getByID(args).then((data) => event.reply('gotSong', data))
})

ipcMain.on('getFilePath', async function (event: Electron.IpcMainEvent, args) {
  const dbInstance = new PathsDBInstance()
  dbInstance.getByID(args).then((data) => event.reply('gotSongPath', data))
})
