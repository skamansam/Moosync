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
    <b-row class="h-100">
      <SongView :songList="songList" @onRowContext="getSongMenu(arguments[0], arguments[1], undefined)" />
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import SongView from '@/mainWindow/components/SongView.vue'
import { Song } from '@/utils/models/songs'

import { mixins } from 'vue-class-component'
import ContextMenuMixin, { ContextTypes } from '@/utils/ui/mixins/ContextMenuMixin'
import { Playlist } from '@/utils/models/playlists'
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

  private getSongMenu(event: Event, songs: Song[], exclude: string | undefined) {
    this.getContextMenu(event, {
      type: ContextTypes.PLAYLIST_CONTENT,
      args: { songs: songs, isRemote: this.isYoutubePlaylist === 'true' || this.isSpotifyPlaylist === 'true' }
    })
  }
}
</script>
