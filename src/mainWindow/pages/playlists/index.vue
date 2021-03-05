<template>
  <b-container fluid class="album-container">
    <b-row class="title">Playlists</b-row>
    <b-row class="d-flex">
      <b-col col xl="2" md="3" v-for="playlist in playlists" :key="playlist.playlist_id">
        <CardView
          :title="playlist.playlist_name"
          :imgSrc="playlist.playlist_coverPath"
          @click.native="gotoPlaylist(playlist)"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Playlist } from '@/models/playlists'
import { IpcEvents, PlaylistEvents } from '@/utils/ipc/main/constants'
import { Component } from 'vue-property-decorator'
import CardView from '@/mainWindow/components/generic/CardView.vue'
import { ipcRendererHolder } from '@/utils/ipc/renderer'
import { mixins } from 'vue-class-component'
import RouterPushes from '@/utils/mixins/RouterPushes'

@Component({
  components: {
    CardView,
  },
})
export default class Albums extends mixins(RouterPushes) {
  private playlists: Playlist[] = []
  private getPlaylists() {
    ipcRendererHolder
      .send<Playlist[]>(IpcEvents.PLAYLIST, { type: PlaylistEvents.GET_ALL_PLAYLISTS })
      .then((data) => {
        this.playlists = data
      })
  }

  mounted() {
    this.getPlaylists()
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
