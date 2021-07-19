export const extensionEventsKeys = ['song-change', 'playerState-change', 'volume-change', 'songQueue-change'] as const
export const extensionRequestsKeys = ['get-all-songs'] as const
export const mainRequestsKeys = ['get-installed-extensions', 'find-new-extensions'] as const

export type extensionEvents = typeof extensionEventsKeys[number]
export type extensionRequests = typeof extensionRequestsKeys[number]
export type mainRequests = typeof mainRequestsKeys[number]
