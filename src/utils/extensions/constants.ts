import { MoosyncExtensionTemplate } from '@moosync/moosync-types';

export const extensionEventsKeys: (keyof MoosyncExtensionTemplate)[] = ['onSongChanged', 'onPlayerStateChanged', 'onSongQueueChanged', 'onVolumeChanged', 'onPreferenceChanged', 'onSeeked']
export const extensionRequestsKeys = ['get-songs', 'get-preferences', 'set-preferences'] as const
export const extensionUIRequestsKeys = ['get-current-song', 'get-volume', 'get-time', 'get-queue', 'get-player-state'] as const
export const playerControlRequests = ['play', 'pause', 'stop', 'next', 'prev'] as const
export const mainRequestsKeys = ['get-installed-extensions', 'find-new-extensions', 'toggle-extension-status', 'remove-extension'] as const

export type extensionEvents = typeof extensionEventsKeys[number]
export type extensionUIRequests = typeof extensionUIRequestsKeys[number] | typeof playerControlRequests[number]
export type extensionRequests = typeof extensionRequestsKeys[number] | extensionUIRequests
export type mainRequests = typeof mainRequestsKeys[number]

