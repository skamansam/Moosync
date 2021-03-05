<template>
  <b-container fluid class="album-container">
    <b-row class="title">Albums</b-row>
    <b-row class="d-flex">
      <b-col col xl="2" md="3" v-for="album in filteredAlbumList" :key="album.album_id">
        <CardView :title="album.album_name" :imgSrc="album.album_coverPath" @click.native="gotoAlbum(album)" />
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import CardView from '@/mainWindow/components/generic/CardView.vue'
import { Album } from '@/models/albums'
import { AlbumEvents, IpcEvents } from '@/utils/ipc/main/constants'
import { ipcRendererHolder } from '@/utils/ipc/renderer'
import { mixins } from 'vue-class-component'
import { Component } from 'vue-property-decorator'
import RouterPushes from '@/utils/mixins/RouterPushes'

@Component({
  components: {
    CardView,
  },
})
export default class Albums extends mixins(RouterPushes) {
  private albumList: Album[] = []
  private getAlbums() {
    ipcRendererHolder
      .send<Album[]>(IpcEvents.ALBUM, { type: AlbumEvents.GET_ALL_ALBUMS })
      .then((data) => {
        this.albumList = data
      })
  }

  get filteredAlbumList() {
    return this.albumList.filter((x) => {
      return x.album_name !== null
    })
  }

  mounted() {
    this.getAlbums()
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
