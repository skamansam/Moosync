<template>
  <b-container fluid>
    <b-row>
      <div></div>
    </b-row>
    <b-row>
      <SongView :songList="songList" />
    </b-row>
  </b-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import SongView from '@/components/SongView.vue'
import { Album } from '@/models/albums'
import { ipcRendererHolder } from '@/utils/ipc/renderer'
import { IpcEvents } from '@/utils/ipc/main/constants'
import { Song } from '@/models/songs'

@Component({
  components: {
    SongView,
  },
})
export default class SingleAlbumView extends Vue {
  private album: Album | null = null
  private songList: Song[] = []

  mounted() {
    this.fetchAlbum()
  }

  private fetchAlbum() {
    console.log(this.$route.params.id)
    ipcRendererHolder
      .send<Song[]>(IpcEvents.GET_ALBUM, {
        responseChannel: IpcEvents.GOT_ALBUM,
        params: { id: this.$route.params.id },
      })
      .then((data) => {
        this.songList = data
      })
  }
}
</script>
