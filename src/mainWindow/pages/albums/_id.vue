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
      @onRowContext="getSongMenu(arguments[0], arguments[1], undefined)"
      @playAll="playAlbum"
      @addToQueue="addAlbumToQueue"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import SongView from '@/mainWindow/components/SongView.vue'

import { mixins } from 'vue-class-component'
import ContextMenuMixin from '@/utils/ui/mixins/ContextMenuMixin'
import { vxm } from '@/mainWindow/store'
import PlayerControls from '@/utils/ui/mixins/PlayerControls'
import RemoteSong from '@/utils/ui/mixins/remoteSongMixin'
import { arrayDiff } from '@/utils/common'

@Component({
  components: {
    SongView
  }
})
export default class SingleAlbumView extends mixins(ContextMenuMixin, PlayerControls, RemoteSong) {
  private album: Album | null = null
  private songList: Song[] = []

  @Prop({ default: '' })
  private album_id!: string

  @Prop({ default: '' })
  private album_name!: string

  @Prop({ default: '' })
  private album_artist!: string

  @Prop({ default: '' })
  private album_coverPath!: string

  @Prop({ default: '' })
  private album_song_count!: string

  get playlists() {
    return vxm.playlist.playlists
  }

  get buttonGroups(): SongDetailButtons {
    return {
      enableContainer: true,
      enableLibraryStore: false
    }
  }

  private defaultDetails: SongDetailDefaults = {
    defaultTitle: this.album_name,
    defaultSubtitle: this.album_artist,
    defaultSubSubtitle: `${this.album_song_count} Songs`,
    defaultCover: this.album_coverPath
  }

  mounted() {
    this.fetchAlbum()
  }

  private async fetchAlbum() {
    this.songList = await window.DBUtils.getSingleAlbum(this.album_id)
  }

  private getSongMenu(event: Event, songs: Song[], exclude: string | undefined) {
    this.getContextMenu(event, {
      type: 'SONGS',
      args: {
        songs: songs,
        exclude: exclude,
        refreshCallback: () => (this.songList = arrayDiff(this.songList, songs))
      }
    })
  }

  private playAlbum() {
    this.playTop(...this.songList)
  }

  private addAlbumToQueue() {
    this.queueSong(...this.songList)
  }
}
</script>
