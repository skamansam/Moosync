export const extensionEventsKeys = ['song-change', 'playerState-change', 'volume-change', 'songQueue-change'] as const
export const extensionRequestsKeys = ['get-all-songs', 'get-preferences'] as const
export const extensionUIRequestsKeys = ['get-current-song', 'get-volume', 'get-time', 'get-queue'] as const
export const mainRequestsKeys = ['get-installed-extensions', 'find-new-extensions'] as const

export type extensionEvents = typeof extensionEventsKeys[number]
export type extensionRequests = typeof extensionRequestsKeys[number] | typeof extensionUIRequestsKeys[number]
export type extensionUIRequests = typeof extensionUIRequestsKeys[number]
export type mainRequests = typeof mainRequestsKeys[number]

