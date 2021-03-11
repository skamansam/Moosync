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
    <b-row>
      <SongView :songList="songList" @onRowContext="getSongContextMenu(undefined, ...arguments)" />
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import SongView from '@/mainWindow/components/SongView.vue'
import { ipcRendererHolder } from '@/utils/ipc/renderer'
import { ArtistEvents, IpcEvents } from '@/utils/ipc/main/constants'
import { Song } from '@/models/songs'

import { mixins } from 'vue-class-component'
import ContextMenuMixin from '@/utils/mixins/ContextMenuMixin'
import { artists } from '@/models/artists'

@Component({
  components: {
    SongView,
  },
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

  private fetchArtist() {
    ipcRendererHolder
      .send<Song[]>(IpcEvents.ARTIST, {
        type: ArtistEvents.GET_ARTIST,
        params: { id: this.artist_id },
      })
      .then((data) => {
        this.songList = data
      })
  }
}
</script>
