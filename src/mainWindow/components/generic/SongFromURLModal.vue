<template>
  <b-modal class="song-url-modal" centered size="lg" :id="id" :ref="id" hide-footer hide-header>
    <div class="modal-content-container">
      <b-container fluid class="p-0">
        <b-row no-gutters class="d-flex">
          <b-col cols="auto">
            <SongDefault v-if="forceEmptyImg || !parsedSong" class="song-url-cover" />
            <b-img
              v-else
              class="song-url-cover"
              :src="parsedSong.song_coverPath_high"
              @error="handleImageError"
            ></b-img>
          </b-col>
          <b-col>
            <b-row no-gutters class="song-url-details">
              <b-col cols="12">
                <div class="d-flex">
                  <b-input
                    v-model="url"
                    id="song-url-title"
                    class="song-url-title"
                    placeholder="song-url Name..."
                    debounce="500"
                    @update="parseURL"
                    onkeypress="this.style.width = this.value.length + 'ch'"
                  />
                </div>
              </b-col>
            </b-row>
            <b-row class="song-url-details">
              <b-col v-if="parsedSong">
                <b-row>
                  {{ parsedSong.title }}
                </b-row>
                <b-row>
                  {{ parsedSong.artists && parsedSong.artists.join(', ') }}
                </b-row>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
      </b-container>
      <b-button class="create-button" @click="addToLibrary">Create</b-button>
    </div>
  </b-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import SongDefault from '@/icons/SongDefault.vue'
import { bus } from '@/mainWindow/main'
import { EventBus } from '@/utils/main/ipc/constants'
import { vxm } from '@/mainWindow/store'

@Component({
  components: {
    SongDefault
  }
})
export default class SongFromUrlModal extends Vue {
  @Prop({ default: 'SongFromURL' })
  private id!: string

  private forceEmptyImg: boolean = false

  private url: string = ''

  private parsedSong: Song | undefined | null = null

  private refreshCallback?: () => void

  private handleImageError() {
    this.forceEmptyImg = true
  }

  private async parseURL() {
    this.parsedSong =
      (await vxm.providers.youtubeProvider.getSongDetails(this.url)) ??
      (await vxm.providers.spotifyProvider.getSongDetails(this.url)) ??
      null
  }

  private addToLibrary() {
    window.DBUtils.storeSongs([this.parsedSong])

    this.refreshCallback && this.refreshCallback()
    this.$bvModal.hide(this.id)
  }

  mounted() {
    bus.$on(EventBus.SHOW_SONG_FROM_URL_MODAL, (refreshCallback: () => void) => {
      this.refreshCallback = refreshCallback
      this.$bvModal.show(this.id)
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

.song-url-cover
  width: 157px
  height: 157px
  object-fit: cover
  border-radius: 16px

.song-url-desc
  width: 100%
  background-color: transparent
  color: var(--textPrimary)
  border: 0
  padding: 0
  padding-left: 10px
  margin-top: 15px
  border-radius: 0
  border-left: 1px solid transparent
  &:focus
    -webkit-box-shadow: none
    box-shadow: none
  &:hover
    border-left: 1px solid var(--accent)
  &::-webkit-scrollbar-track
    margin-top: 0

.song-url-details
  margin-left: 40px
  max-width: 100%

.songs-count
  font-size: 14px
  text-align: start

.edit-icon
  width: 15px
  height: 15px
  min-width: 15px
  min-height: 15px
  margin-left: 15px
  margin-top: 5px

.song-url-title
  font-size: 26px
  max-width: 100%
  margin-bottom: 15px !important
  color: var(--textPrimary)
  background-color: transparent
  border: 0
  border-bottom: 1px solid transparent
  border-radius: 0
  padding: 0
  &:hover
    border-bottom: 1px solid var(--accent)
  &:focus
    border-bottom: 1px solid var(--accent)
    outline: none
    -webkit-box-shadow: none

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
