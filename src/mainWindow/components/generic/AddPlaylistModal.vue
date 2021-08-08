<template>
  <b-modal class="playlist-modal" centered size="lg" :id="id" :ref="id" hide-footer hide-header>
    <div class="modal-content-container">
      <b-container fluid class="p-0">
        <b-row no-gutters class="d-flex">
          <SongDefault v-if="forceEmptyImg" class="playlist-cover" />
          <b-col class="playlist-details">
            <div class="d-flex">
              <b-input
                v-model="title"
                id="playlist-title"
                class="playlist-title"
                placeholder="Playlist Name..."
                onkeypress="this.style.width = this.value.length + 'ch'"
              />
            </div>
          </b-col>
        </b-row>
      </b-container>
      <b-button class="create-button" @click="createPlaylist">Create</b-button>
    </div>
  </b-modal>
</template>

<script lang="ts">
import { EventBus } from '@/utils/main/ipc/constants'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { bus } from '@/mainWindow/main'
import { vxm } from '@/mainWindow/store'
import SongDefault from '@/icons/SongDefault.vue'
@Component({
  components: {
    SongDefault
  }
})
export default class NewPlaylistModal extends Vue {
  @Prop({ default: 'PlaylistFromURL' })
  private id!: string

  private title: string = 'https://www.youtube.com/playlist?list=PLO0BbVUKhznedJgQf90LTU7VX-f3U13Af'
  private forceEmptyImg: boolean = false

  private showing: boolean = false

  private isDuplicatePlaylistName(): boolean {
    for (const playlist of Object.values(vxm.playlist.playlists)) {
      if (this.title === playlist) {
        return true
      }
    }
    return false
  }

  private async createPlaylist() {
    // this.ytFetcher.fetch(this.title)
  }

  private handleImageError() {
    this.forceEmptyImg = true
  }

  private async addToPlaylist(playlist_id: string, songs: Song[]) {
    window.DBUtils.addToPlaylist(playlist_id, ...songs)
  }

  mounted() {
    bus.$on(EventBus.SHOW_ADD_PLAYLIST_MODAL, () => {
      if (!this.showing) {
        this.forceEmptyImg = false
        this.$bvModal.show(this.id)
      }
    })
  }
}
</script>

<style lang="sass" scoped>
.topbar-container
  background: var(--primary)
  height: 70px
  padding-left: calc(261px + 30px + 7.5px)

.modal-content-container
  margin: 35px 35px 35px 35px

.create-button
  font-size: 16px
  color: var(--textInverse)
  background-color: var(--accent)
  border-radius: 6px
  float: right
  margin-bottom: 20px
  margin-top: 15px
  border: 0
</style>
