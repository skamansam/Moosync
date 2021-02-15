<template>
  <b-container fluid class="album-container">
    <b-row class="title">Albums</b-row>
    <b-row class="d-flex">
      <b-col col xl="2" md="3" v-for="artist in artistList" :key="artist.artist_id">
        <AlbumCard :title="artist.artist_name" :imgSrc="artist.coverPath" />
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
// eslint-disable-next-line no-unused-vars
import { artists } from '@/models/artists'
import { IpcEvents } from '@/services/ipc/main/constants'
import { IpcRendererHolder } from '@/services/ipc/renderer'
import { ipcRenderer } from 'electron'
import { Component, Vue } from 'vue-property-decorator'
import AlbumCard from './albums/AlbumCard.vue'

@Component({
  components: {
    AlbumCard,
  },
})
export default class Artists extends Vue {
  private IpcHolder = new IpcRendererHolder(ipcRenderer)
  private artistList: artists[] = []
  private getArtists() {
    this.IpcHolder.send<artists[]>(IpcEvents.GET_ARTISTS, { responseChannel: IpcEvents.GOT_ARTISTS }).then((data) => {
      this.artistList = data
    })
  }

  mounted() {
    this.getArtists()
  }
}
</script>

<style lang="sass" scoped>
.album-container
  position: absolute
.title
  font-family: Proxima Nova
  font-style: normal
  font-weight: bold
  font-size: 64px
  line-height: 100px
  padding-left: 15px
  margin-bottom: 50px
</style>
