<route>
{
  "props": true
}
</route>
<template>
  <b-container fluid>
    <b-row>
      <div>{{ artist_name }}</div>
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
import { artists } from '@/utils/models/artists'

@Component({
  components: {
    SongView
  }
})
export default class SingleArtistView extends mixins(ContextMenuMixin) {
  private artist: artists | null = null
  private songList: Song[] = []

  @Prop({ default: '' })
  private artist_id!: string

  @Prop({ default: '' })
  private artist_name!: string

  @Prop({ default: '' })
  private artist_coverPath!: string

  mounted() {
    this.fetchArtist()
  }

  private async fetchArtist() {
    this.songList = await window.DBUtils.getSingleArtist(this.artist_id)
  }

  private getSongMenu(event: Event, songs: Song[], exclude: string | undefined) {
    this.getContextMenu(event, { type: ContextTypes.SONGS, args: { songs: songs, exclude: exclude } })
  }
}
</script>
