<template>
  <b-modal :id="id" hide-footer>
    <div class="d-block text-center">
      <h3>New playlist</h3>
    </div>
    <b-button class="mt-3" variant="outline-danger" block>Close Me</b-button>
    <b-button class="mt-2" variant="outline-warning" block @click="createPlaylist">Toggle Me</b-button>
  </b-modal>
</template>

<script lang="ts">
import { EventBus, IpcEvents, PlaylistEvents } from '@/utils/ipc/main/constants'
import { ipcRendererHolder } from '@/utils/ipc/renderer'
import { PlaylistModule } from '@/mainWindow/store/playlists'
import { Component, Prop } from 'vue-property-decorator'
import Colors from '@/utils/mixins/Colors'
import { mixins } from 'vue-class-component'
import { bus } from '@/mainWindow/main'

@Component({})
export default class NewPlaylistModal extends mixins(Colors) {
  @Prop({ default: 'NewPlaylistModal' })
  private id!: string
  private showing: boolean = false
  private callback: ((id: string) => void) | null = null

  private async createPlaylist() {
    ipcRendererHolder
      .send<string>(IpcEvents.PLAYLIST, { type: PlaylistEvents.CREATE_PLAYLIST, params: { name: 'henlo' } })
      .then((playlist_id: string) => {
        this.$bvModal.hide(this.id)
        PlaylistModule.setUpdated(true)
        if (this.callback) {
          this.callback(playlist_id)
          this.callback = null
        }
      })
  }

  mounted() {
    bus.$on(EventBus.SHOW_NEW_PLAYLIST_MODAL, (callback: (id: string) => void) => {
      if (!this.showing) {
        this.callback = callback
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
</style>
