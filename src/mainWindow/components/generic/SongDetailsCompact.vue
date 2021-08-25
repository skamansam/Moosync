<template>
  <b-container fluid class="h-100">
    <b-row no-gutters class="h-100">
      <b-col class="h-100 position-relative">
        <div class="image-container w-100 h-100">
          <div class="embed-responsive embed-responsive-1by1">
            <div class="embed-responsive-item">
              <transition name="fade">
                <b-img class="h-100 w-100 albumart" v-if="computedImg" :src="computedImg" :key="computedImg" />
                <SongDefault class="albumart w-100" v-if="!computedImg" />
              </transition>
            </div>
          </div>

          <div v-if="currentSong" class="song-info-container">
            <div class="d-flex">
              <div class="song-title text-truncate">{{ currentSong.title }}</div>
            </div>
            <div class="song-subtitle text-truncate">
              {{ currentSong.artists && currentSong.artists.join(', ') }}
              {{
                currentSong.artists &&
                currentSong.artists.length > 0 &&
                currentSong.album &&
                currentSong.album.album_name
                  ? ' - '
                  : ''
              }}
              {{ currentSong.album && currentSong.album.album_name }}
            </div>
            <!-- <div class="song-timestamp">{{ formattedDuration(currentSong.duration) }}</div> -->
          </div>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import ImgLoader from '@/utils/ui/mixins/ImageLoader'
import Component, { mixins } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import SongDefault from '@/icons/SongDefault.vue'
import { convertDuration } from '@/utils/common'

@Component({
  components: {
    SongDefault
  }
})
export default class SongDetailsCompact extends mixins(ImgLoader) {
  @Prop({ default: null })
  private currentSong!: Song | null | undefined

  private forceEmptyImg = false

  private formattedDuration = convertDuration

  get computedImg() {
    return this.getImgSrc(this.getValidImageHigh(this.currentSong))
  }

  @Watch('src')
  private onSrcChange() {
    this.forceEmptyImg = false
  }

  private handleCoverError() {
    this.forceEmptyImg = true
  }
}
</script>

<style lang="sass" scoped>
.albumart
  border-radius: 28px
  -webkit-user-select: none
  user-select: none
  object-fit: cover

.image-container
  position: relative
  overflow-y: scroll
  transition: color 0.3s ease
  color: transparent
  text-shadow: 0 0 white
  &::-webkit-scrollbar-track
    background: transparent
    margin-top: 0 !important
  &:hover
    color: white

.song-info-container
  text-align: left
  margin-top: 15px
  .song-title
    font-weight: bold
    font-size: 24px
  .song-subtitle
    font-weight: 250
    font-size: 18px
  .song-timestamp
    font-weight: 600
    font-size: 16px
.scroller
  height: 100%
  &::-webkit-scrollbar-track
    margin: 0

.main-container
  position: absolute
  left: 0
  top: 0
  padding-top: 72px
  padding-bottom: 30px

.queue-container
  overflow-y: scroll
  &::-webkit-scrollbar-track
    background: transparent
    margin: 0

.right-container
  margin-left: 5rem

.bg-img
  height: 100vh
  width: 100vw
  object-fit: cover
  filter: blur(10px)
  position: absolute
  top: 0
  left: 0
  z-index: -9999
</style>
