<route>
{
  "props": true
}
</route>
<template>
  <div class="w-100">
    <SongView
      :defaultDetails="defaultDetails"
      :songList="songList"
      :detailsButtonGroup="buttonGroups"
      :tableBusy="tableBusy"
      @onRowContext="getSongMenu(arguments[0], arguments[1], undefined)"
      @playAll="playPlaylist"
      @addToQueue="addPlaylistToQueue"
      @addToLibrary="addPlaylistToLibrary"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import SongView from '@/mainWindow/components/SongView.vue'

import { mixins } from 'vue-class-component'
import ContextMenuMixin from '@/utils/ui/mixins/ContextMenuMixin'
import { vxm } from '@/mainWindow/store'
import { arrayDiff } from '@/utils/common'

@Component({
  components: {
    SongView
  }
})
export default class SinglePlaylistView extends mixins(ContextMenuMixin) {
  private songList: Song[] = []

  private tableBusy: boolean = false

  private playlist: Playlist | null = null

  get buttonGroups(): SongDetailButtons {
    return {
      enableContainer: true,
      enableLibraryStore: false
    }
  }

  get defaultDetails(): SongDetailDefaults {
    return {
      defaultTitle: this.playlist?.playlist_name,
      defaultSubSubtitle: `${this.playlist?.playlist_song_count} Songs`,
      defaultCover: this.playlist?.playlist_coverPath
    }
  }

  created() {
    this.fetchAlbum()
    this.fetchSongList()
  }

  private async fetchAlbum() {
    this.playlist = (
      await window.SearchUtils.searchEntityByOptions({
        playlist: {
          playlist_id: this.$route.params.id
        }
      })
    )[0]
  }

  private async fetchSongList() {
    this.songList = await window.SearchUtils.searchSongsByOptions({
      playlist: {
        playlist_id: this.$route.params.id
      }
    })
  }

  private async fetchAsyncGen() {
    // let generator
    // if (this.isYoutubePlaylist === 'true')
    //   generator = vxm.providers.youtubeProvider.getPlaylistContent(this.playlist_id.replace('youtube-', ''))
    // else if (this.isSpotifyPlaylist === 'true')
    //   generator = vxm.providers.spotifyProvider.getPlaylistContent(this.playlist_id.replace('spotify-', ''))
    // if (generator)
    //   for await (const items of generator) {
    //     this.songList.push(...items)
    //   }
  }

  private getSongMenu(event: Event, songs: Song[], exclude: string | undefined) {
    // this.getContextMenu(event, {
    //   type: 'PLAYLIST_CONTENT',
    //   args: {
    //     songs: songs,
    //     isRemote: this.isYoutubePlaylist === 'true' || this.isSpotifyPlaylist === 'true',
    //     refreshCallback: () => (this.songList = arrayDiff(this.songList, songs))
    //   }
    // })
  }

  private playPlaylist() {
    this.playTop(this.songList)
  }

  private addPlaylistToQueue() {
    this.queueSong(this.songList)
  }

  private addPlaylistToLibrary() {
    this.addSongsToLibrary(...this.songList)
  }
}
</script>
