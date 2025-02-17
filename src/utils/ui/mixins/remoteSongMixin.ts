/*
 *  remoteSongMixin.ts is a part of Moosync.
 *
 *  Copyright 2021-2022 by Sahil Gupte <sahilsachingupte@gmail.com>. All rights reserved.
 *  Licensed under the GNU General Public License.
 *
 *  See LICENSE in the project root for license information.
 */

import { Component, Vue } from 'vue-property-decorator'

@Component
export default class RemoteSong extends Vue {
  public addYTItemsToLibrary(...songs: Song[]) {
    window.DBUtils.storeSongs(songs)
    this.$toasted.show(`Added ${songs.length} songs to library`)
  }

  public addSongsToLibrary(...songs: Song[]) {
    window.DBUtils.storeSongs(songs)
    this.$toasted.show(`Added ${songs.length} songs to library`)
  }
}
