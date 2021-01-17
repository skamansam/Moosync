import { ipcRenderer } from 'electron'

export const startScanner = () => {
  ipcRenderer.send('scan-music')
}
