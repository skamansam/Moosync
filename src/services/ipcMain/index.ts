import { ipcMain } from 'electron'
import { MusicScanner } from '../files/scanner'
import { CoverDBInstance, SongDBInstance } from '../db/index'
import { IpcEvents } from './constants'

ipcMain.on(IpcEvents.SCAN_MUSIC, async function (event: Electron.IpcMainEvent, args: string[]) {
  const scanner = new MusicScanner(...args)
  scanner.start()
})

ipcMain.on(IpcEvents.GET_ALL_SONGS, async function (event: Electron.IpcMainEvent) {
  const dbInstance = new SongDBInstance()
  dbInstance.getAll().then((data) => event.reply(IpcEvents.GOT_ALL_SONGS, data))
})

ipcMain.on(IpcEvents.GET_COVER, async function (event: Electron.IpcMainEvent, arg: string) {
  const dbInstance = new CoverDBInstance()
  dbInstance.getByID(arg).then((data) => event.reply(IpcEvents.GOT_COVER, data))
})
