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
import { IpcEvents, PlaylistEvents } from '@/utils/ipc/main/constants'
import { ipcRendererHolder } from '@/utils/ipc/renderer'
import { PlaylistModule } from '@/store/playlists'
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class NewPlaylistModal extends Vue {
  @Prop({ default: 'NewPlaylistModal' })
  private id!: string

  private createPlaylist() {
    ipcRendererHolder
      .send<void>(IpcEvents.PLAYLIST, { type: PlaylistEvents.CREATE_PLAYLIST, params: { name: 'henlo' } })
      .then(() => {
        this.$bvModal.hide(this.id)
        PlaylistModule.setUpdated(true)
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
