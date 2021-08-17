<template>
  <b-modal class="playlist-url-modal" centered size="lg" :id="id" :ref="id" hide-footer hide-header>
    <div class="modal-content-container">
      <b-container fluid class="p-0">
        <b-row no-gutters class="d-flex">
          <b-col cols="auto">
            <SongDefault v-if="forceEmptyImg || !playlist" class="playlist-url-cover" />
            <b-img
              v-else
              class="playlist-url-cover"
              :src="playlist.playlist_coverPath"
              @error="handleImageError"
            ></b-img>
          </b-col>
          <b-col>
            <b-row no-gutters class="playlist-url-details">
              <b-col cols="12">
                <div class="d-flex">
                  <b-input
                    v-model="url"
                    id="playlist-url-title"
                    class="playlist-url-title"
                    placeholder="playlist-url Name..."
                    debounce="500"
                    @update="parseURL"
                    onkeypress="this.style.width = this.value.length + 'ch'"
                  />
                </div>
              </b-col>
            </b-row>
            <b-row class="playlist-url-details">
              <b-col v-if="songList && songList.length > 0">
                <b-row> {{ songList.length }} Songs </b-row>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
        <b-row v-if="songList && songList.length !== 0" no-gutters class="playlist-content-recycler-row">
          <div class="h-100 w-100">
            <RecycleScroller
              class="scroller"
              :items="songList"
              :item-size="83"
              key-field="_id"
              v-slot="{ item, index }"
              :direction="'vertical'"
            >
              <SingleSearchResult
                class="single-result"
                :title="item.title"
                :subtitle="item.artists ? item.artists.join(', ') : ''"
                :coverImg="getImgSrc(getValidImageLow(item))"
                :divider="index != songList.length - 1"
                :id="index"
                @imgClick="handleClick"
              />
            </RecycleScroller>
          </div>
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
import { mixins } from 'vue-class-component'
import ImgLoader from '@/utils/ui/mixins/ImageLoader'
import SingleSearchResult from '@/mainWindow/components/generic/SingleSearchResult.vue'
import PlayerControls from '@/utils/ui/mixins/PlayerControls'

@Component({
  components: {
    SongDefault,
    SingleSearchResult
  }
})
export default class PlaylistFromUrlModal extends mixins(PlayerControls, ImgLoader) {
  @Prop({ default: 'PlaylistFromURL' })
  private id!: string

  private forceEmptyImg: boolean = false

  private url: string = ''

  private songList: Song[] = []
  private playlist: Playlist | null = null

  private handleImageError() {
    this.forceEmptyImg = true
  }

  private refreshCallback?: () => void

  private async parseURL() {
    let generator
    this.songList = []
    this.playlist = null

    if (vxm.providers.youtubeProvider.matchPlaylist(this.url)) {
      this.playlist = (await vxm.providers.youtubeProvider.getUserPlaylist(this.url, true)) ?? null
      generator = vxm.providers.youtubeProvider.getPlaylistContent(this.url, true)
    }

    if (vxm.providers.spotifyProvider.matchPlaylist(this.url)) {
      this.playlist = (await vxm.providers.spotifyProvider.getUserPlaylist(this.url, true)) ?? null
      generator = vxm.providers.spotifyProvider.getPlaylistContent(this.url, true)
    }

    if (generator) {
      for await (const items of generator) {
        this.songList.push(...items)
      }
    }
  }

  private handleClick(index: any) {
    this.playTop([this.songList![index]])
  }

  private async addToLibrary() {
    if (this.playlist) {
      const playlistId = await window.DBUtils.createPlaylist(
        this.playlist.playlist_name,
        '',
        this.playlist.playlist_coverPath ?? ''
      )

      await window.DBUtils.storeSongs(this.songList)
      await window.DBUtils.addToPlaylist(playlistId, ...this.songList)

      this.playlist = null
      this.songList = []

      this.refreshCallback && this.refreshCallback()

      this.$bvModal.hide(this.id)
    }
  }

  mounted() {
    bus.$on(EventBus.SHOW_PLAYLIST_FROM_URL_MODAL, (refreshCallback: () => void) => {
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

.playlist-url-cover
  width: 157px
  height: 157px
  object-fit: cover
  border-radius: 16px

.playlist-url-desc
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

.playlist-url-details
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

.playlist-url-title
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

.playlist-content-recycler-row
  height: 200px
  margin-top: 30px
  margin-bottom: 8px

.scroller
  height: 100% !important
  margin-right: -10px
  margin-left: -10px
  &::-webkit-scrollbar-track
    margin-top: 0
</style>
