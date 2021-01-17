import { ipcMain } from 'electron'
import { MusicScanner } from '../files/scanner'

const scanner = new MusicScanner('/home/ovenoboyo')

ipcMain.on('scan-music', function (event: Electron.IpcMainEvent) {
  scanner.start()
})
