import { app } from 'electron'

export function enableStartup(enabled: boolean) {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    enabled,
  })
}