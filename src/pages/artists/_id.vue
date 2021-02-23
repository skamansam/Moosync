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
      <SongView :songList="songList" />
    </b-row>
  </b-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import SongView from '@/components/SongView.vue'
import { ipcRendererHolder } from '@/utils/ipc/renderer'
import { ArtistEvents, IpcEvents } from '@/utils/ipc/main/constants'
import { Song } from '@/models/songs'
import Artists from './index.vue'

@Component({
  components: {
    SongView,
  },
})
export default class SingleAlbumView extends Vue {
  private artist: Artists | null = null
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
