/*
 *  constants.ts is a part of Moosync.
 *
 *  Copyright 2022 by Sahil Gupte <sahilsachingupte@gmail.com>. All rights reserved.
 *  Licensed under the GNU General Public License.
 *
 *  See LICENSE in the project root for license information.
 */

export const extensionRequestsKeys = [
  'get-songs',
  'add-songs',
  'add-playlist',
  'add-song-to-playlist',
  'remove-song',
  'get-preferences',
  'get-secure-preferences',
  'set-preferences',
  'set-secure-preferences',
  'register-oauth',
  'open-external'
] as const
export const extensionUIRequestsKeys = [
  'get-current-song',
  'get-volume',
  'get-time',
  'get-queue',
  'get-player-state'
] as const
export const playerControlRequests = ['play', 'pause', 'stop', 'next', 'prev'] as const
export const mainRequestsKeys = [
  'get-installed-extensions',
  'find-new-extensions',
  'toggle-extension-status',
  'remove-extension',
  'stop-process',
  'get-extension-icon',
  'extra-extension-events',
  'get-extension-context-menu',
  'on-clicked-context-menu',
  'set-log-level'
] as const

export type extensionUIRequests = typeof extensionUIRequestsKeys[number] | typeof playerControlRequests[number]
export type extensionRequests = typeof extensionRequestsKeys[number] | extensionUIRequests
export type mainRequests = typeof mainRequestsKeys[number]
