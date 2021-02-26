export type musicPaths = { path: string; enabled: boolean }[]
export interface Preferences {
  musicPaths: musicPaths
}

export enum Databases {
  SONG = 'song',
  ALBUMS = 'albums',
}

export const defaultPreferences: Preferences = {
  musicPaths: [],
}
