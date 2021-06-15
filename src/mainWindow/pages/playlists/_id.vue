<route>
{
  "props": true
}
</route>
<template>
  <b-container fluid>
    <b-row>
      <div>{{ playlist_name }}</div>
    </b-row>
    <b-row>
      <SongView :songList="songList" @onRowContext="getSongContextMenu(undefined, arguments[0], ...arguments[1])" />
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import SongView from '@/mainWindow/components/SongView.vue'
import { Song } from '@/models/songs'

import { mixins } from 'vue-class-component'
import ContextMenuMixin from '@/utils/mixins/ContextMenuMixin'
import { Playlist } from '@/models/playlists'
import { vxm } from '@/mainWindow/store'

@Component({
  components: {
    SongView
  }
})
export default class SinglePlaylistView extends mixins(ContextMenuMixin) {
  private playlist: Playlist | null = null
  private songList: Song[] = []

  @Prop({ default: '' })
  private playlist_id!: string

  @Prop({ default: '' })
  private playlist_name!: string

  @Prop({ default: '' })
  private playlist_coverPath!: string

  @Prop({ default: false })
  private isYoutubePlaylist!: string

  @Prop({ default: false })
  private isSpotifyPlaylist!: string

  mounted() {
    this.fetchPlaylist()
  }

  private async fetchPlaylist() {
    if (this.isYoutubePlaylist === 'true') {
      this.songList = await vxm.providers.youtubeProvider.getPlaylistContent(this.playlist_id.replace('youtube-', ''))
    } else if (this.isSpotifyPlaylist === 'true') {
      this.songList = await vxm.providers.spotifyProvider.getPlaylistContent(this.playlist_id.replace('spotify-', ''))
    } else {
      this.songList = await window.DBUtils.getSinglePlaylist(this.playlist_id)
    }
  }
}
</script>
