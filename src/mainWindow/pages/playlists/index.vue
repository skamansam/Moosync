<template>
  <b-container fluid class="album-container" @contextmenu="contextHandler">
    <b-row class="title">Playlists</b-row>
    <b-row class="d-flex">
      <b-col col xl="2" md="3" v-for="playlist in allPlaylists" :key="playlist.playlist_id">
        <CardView
          :title="playlist.playlist_name"
          :imgSrc="playlist.playlist_coverPath"
          :id="playlist.playlist_id"
          @click.native="gotoPlaylist(playlist)"
          @CardContextMenu="getPlaylistMenu(arguments[0], playlist)"
        >
          <template slot="icon">
            <SpotifyIcon
              v-if="playlist.playlist_id.startsWith('spotify-')"
              color="#07C330"
              :dropShadow="true"
              :filled="true"
            />
            <YoutubeIcon
              v-if="playlist.playlist_id.startsWith('youtube-')"
              color="#E62017"
              :dropShadow="true"
              :filled="true"
            />
          </template>
        </CardView>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Playlist } from '@/utils/models/playlists'
import { Component } from 'vue-property-decorator'
import CardView from '@/mainWindow/components/generic/CardView.vue'
import { mixins } from 'vue-class-component'
import RouterPushes from '@/utils/ui/mixins/RouterPushes'
import ContextMenuMixin, { ContextTypes } from '@/utils/ui/mixins/ContextMenuMixin'
import { vxm } from '@/mainWindow/store'
import SpotifyIcon from '@/mainWindow/components/icons/Spotify.vue'
import YoutubeIcon from '@/mainWindow/components/icons/Youtube.vue'

@Component({
  components: {
    CardView,
    SpotifyIcon,
    YoutubeIcon
  }
})
export default class Albums extends mixins(RouterPushes, ContextMenuMixin) {
  private allPlaylists: Playlist[] = []
  private async getPlaylists() {
    let localPlaylists = await window.DBUtils.getAllPlaylists()
    let ytPlaylists = await vxm.providers.youtubeProvider.getUserPlaylists()
    let spotifyPlaylists = await vxm.providers.spotifyProvider.getUserPlaylists()
    this.allPlaylists.push(...localPlaylists, ...ytPlaylists, ...spotifyPlaylists)
  }

  private contextHandler(event: MouseEvent) {
    if ((event.target as HTMLElement).localName !== 'img' && !(event.target as HTMLElement).id) {
      this.getContextMenu(event, { type: ContextTypes.GENERAL_PLAYLIST })
    }
  }

  mounted() {
    this.getPlaylists()

    // window.addEventListener('contextmenu', this.contextHandler)
  }

  destroyed() {
    // window.removeEventListener('contextmenu', this.contextHandler)
  }

  private refreshCallback() {
    this.getPlaylists()
    vxm.playlist.updated = true
  }

  private getPlaylistMenu(event: Event, playlist: Playlist) {
    this.getContextMenu(event, {
      type: ContextTypes.PLAYLIST,
      args: { playlist: playlist, refreshCallback: this.refreshCallback }
    })
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
