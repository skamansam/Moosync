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
      @onRowContext="getSongMenu(arguments[0], arguments[1], undefined)"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import SongView from '@/mainWindow/components/SongView.vue'

import { mixins } from 'vue-class-component'
import ContextMenuMixin from '@/utils/ui/mixins/ContextMenuMixin'
import { vxm } from '@/mainWindow/store'

@Component({
  components: {
    SongView
  }
})
export default class SinglePlaylistView extends mixins(ContextMenuMixin) {
  private songList: Song[] = []

  @Prop({ default: '' })
  private playlist_id!: string

  @Prop({ default: '' })
  private playlist_name!: string

  @Prop({ default: '' })
  private playlist_coverPath!: string

  @Prop({ default: '' })
  private playlist_song_count!: string

  @Prop({ default: false })
  private isYoutubePlaylist!: string

  @Prop({ default: false })
  private isSpotifyPlaylist!: string

  mounted() {
    this.fetchPlaylist()
  }

  private defaultDetails = {
    defaultTitle: this.playlist_name,
    defaultSubtitle: this.playlist_song_count,
    defaultCover: this.playlist_coverPath
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
      type: 'PLAYLIST_CONTENT',
      args: { songs: songs, isRemote: this.isYoutubePlaylist === 'true' || this.isSpotifyPlaylist === 'true' }
    })
  }
}
</script>
