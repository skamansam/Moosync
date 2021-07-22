<template>
  <b-container fluid class="album-container" @contextmenu="contextHandler">
    <b-row class="title">Playlists</b-row>
    <b-row class="d-flex">
      <b-col col xl="2" md="3" v-for="playlist in allPlaylists" :key="playlist.playlist_id" class="card-col">
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

          <template #defaultCover>
            <PlaylistDefault />
          </template>
        </CardView>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import CardView from '@/mainWindow/components/generic/CardView.vue'
import { mixins } from 'vue-class-component'
import RouterPushes from '@/utils/ui/mixins/RouterPushes'
import ContextMenuMixin from '@/utils/ui/mixins/ContextMenuMixin'
import { vxm } from '@/mainWindow/store'
import SpotifyIcon from '@/mainWindow/components/icons/Spotify.vue'
import YoutubeIcon from '@/mainWindow/components/icons/Youtube.vue'
import PlaylistDefault from '@/mainWindow/components/icons/PlaylistDefault.vue'

@Component({
  components: {
    CardView,
    SpotifyIcon,
    YoutubeIcon,
    PlaylistDefault
  }
})
export default class Albums extends mixins(RouterPushes, ContextMenuMixin) {
  private allPlaylists: Playlist[] = []
  private async getPlaylists() {
    let localPlaylists = await window.DBUtils.getAllPlaylists()
    let ytPlaylists = await vxm.providers.youtubeProvider.getUserPlaylists()
    let spotifyPlaylists = await vxm.providers.spotifyProvider.getUserPlaylists()
    this.allPlaylists = [...localPlaylists, ...ytPlaylists, ...spotifyPlaylists]
  }

  private contextHandler(event: MouseEvent) {
    if (
      !['img', 'svg', 'rect', 'path'].includes((event.target as HTMLElement).localName) &&
      !(event.target as HTMLElement).id
    ) {
      this.getContextMenu(event, { type: 'GENERAL_PLAYLIST' })
    }
  }

  mounted() {
    this.getPlaylists()
  }

  private refreshCallback() {
    this.getPlaylists()
    vxm.playlist.updated = true
  }

  private getPlaylistMenu(event: Event, playlist: Playlist) {
    this.getContextMenu(event, {
      type: 'PLAYLIST',
      args: { playlist: playlist, refreshCallback: this.refreshCallback }
    })
  }
}
</script>

<style lang="sass" scoped>
.album-container
  position: absolute

.title
  font-weight: bold
  font-size: 55px
  margin-left: 15px
  margin-bottom: 50px
  margin-top: 20px
</style>
