export type musicPaths = { path: string; enabled: boolean }[]
export interface Preferences {
  musicPaths: musicPaths
}

export const defaultPreferences: Preferences = {
  musicPaths: [],
}
