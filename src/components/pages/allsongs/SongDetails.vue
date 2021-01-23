<template>
  <div class="w-100 image-container d-flex">
    <img ref="cover" alt="cover art" />
    <div class="text-container">
      <div class="text-over title">{{ currentTitle }}</div>
      <div class="text-over subtitle">{{ currentsubTitle }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Ref, Vue } from 'vue-property-decorator'
import { ipcRenderer } from 'electron'

// eslint-disable-next-line no-unused-vars
import { Song } from '@/models/songs'

@Component({
  components: {},
})
export default class SongDetails extends Vue {
  @Ref('cover') imageElement!: HTMLImageElement
  private currentTitle: string = ''
  private currentsubTitle: string = ''

  private registerListeners() {
    this.$root.$on('song-select', (id: string) => {
      ipcRenderer.send('getSingleSong', id)
    })

    ipcRenderer.on('gotSong', (_, data: Song) => {
      this.updateDetails(data)
    })
  }

  private updateDetails(data: Song) {
    if (data !== undefined) {
      if (data.cover?.data !== undefined) this.imageElement.src = 'data:image/png;base64, ' + data.cover?.data

      if (data.title !== undefined) this.currentTitle = data.title

      if (data.artists !== undefined) this.currentsubTitle = data.artists.join(', ')
    }
  }

  created() {
    this.registerListeners()
  }
}
</script>

<style lang="sass">
@import '@/sass/variables.sass'

.image-container
  position: relative
  margin-top: 15px

.image-container img
  width: 100%

.text-container
  position: absolute
  text-align: left
  padding-left: 24px
  padding-top: 31px
  width: 100%
  height: 100%
  background: radial-gradient(70.76% 70.76% at 50% 50%, rgba(255, 255, 255, 0.14) 0%, rgba(91, 91, 91, 0) 100%),

.text-over
  font-family: 'Proxima Nova'

.title
  color: $text-primary
  font-size: 36px
  line-height: 32px

.subtitle
  color: $text-primary
  font-weight: 250
  font-size: 18px
  line-height: 18px
</style>
