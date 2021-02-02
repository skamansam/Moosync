<template>
  <div class="w-100 image-container d-flex">
    <b-overlay :show="true" no-center opacity="0.6" blur="2px" variant="dark" class="text-container">
      <img ref="cover" alt="cover art" onerror="this.style.display='none'" />
      <template #overlay>
        <div>
          <div class="text-over title">{{ currentTitle }}</div>
          <div class="text-over subtitle">{{ currentsubTitle }}</div>
        </div>
      </template>
    </b-overlay>
  </div>
</template>

<script lang="ts">
import { Component, Ref, Vue } from 'vue-property-decorator'

// eslint-disable-next-line no-unused-vars
import { Song } from '@/models/songs'
import { EventBus } from '@/services/ipc/main/constants'

@Component({
  components: {},
})
export default class SongDetails extends Vue {
  @Ref('cover') imageElement!: HTMLImageElement
  private currentTitle: string = ''
  private currentsubTitle: string = ''

  private registerListeners() {
    this.$root.$on(EventBus.SONG_SELECTED, (data: Song) => {
      this.updateDetails(data)
    })

    this.$root.$on(EventBus.COVER_SELECTED, (data: Buffer) => {
      this.updateCover(data)
    })
  }

  private updateCover(cover?: Buffer) {
    if (this.imageElement && cover) {
      this.imageElement.style.display = ''
      console.log(cover)
      var blob = new Blob([cover], { type: 'image/png' })
      var imageUrl = URL.createObjectURL(blob)
      this.imageElement.src = imageUrl
    }
  }

  private updateDetails(data?: Song) {
    if (data) {
      if (data) this.currentTitle = data.title
      if (data && data.artists) this.currentsubTitle = data.artists.join(', ')
    }
  }

  created() {
    this.registerListeners()
  }

  mounted() {
    this.imageElement.style.display = 'none'
  }
}
</script>

<style lang="sass">
@import '@/sass/variables.sass'
@import "~bootstrap/scss/mixins"

img
  font-size: 0

.image-container
  position: relative
  margin-top: 15px

.image-container img
  width: 100%

.text-container > .b-overlay > .bg-dark
  background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.58), rgba(0, 0, 0, 0.58)), radial-gradient(50% 50% at 50% 50%, rgba(255, 255, 255, 0) 0%, rgba(0, 0, 0, 0.2) 100%) !important
  background-color: #00000000 !important

.text-over
  font-family: 'Proxima Nova'
  text-align: left
  margin-left: 15px

.title
  color: var(--textPrimary)
  font-size: 2.5vw
  line-height: 32px
  @include media-breakpoint-up(md-c)
    margin-top: 12px
  @include media-breakpoint-up(lg-c)
    margin-top: 22px
  @include media-breakpoint-up(xs)
    margin-top: 8px
  @include media-breakpoint-up(xl)
    margin-top: 30px
    margin-bottom: 13px


.subtitle
  color: var(--textPrimary)
  font-weight: 250
  font-size: 1vw
  line-height: 18px
</style>
