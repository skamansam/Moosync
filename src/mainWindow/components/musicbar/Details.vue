<template>
  <div class="d-flex w-100">
    <b-img
      fluid
      ref="cover"
      class="coverimg"
      v-if="getImgSrc(imgSrc) && !forceEmptyImg"
      :src="getImgSrc(imgSrc)"
      alt="cover art"
      @error="handleImageError"
    />
    <SongDefault v-if="!getImgSrc(imgSrc) || forceEmptyImg" class="coverimg" />
    <div class="text-container">
      <div class="text song-title text-truncate">{{ title }}</div>
      <div class="text song-subtitle text-truncate">{{ artists ? artists.join(', ') : '-' }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import Colors from '@/utils/ui/mixins/Colors'
import { mixins } from 'vue-class-component'
import { Component, Prop, Watch } from 'vue-property-decorator'
import SongDefault from '@/mainWindow/components/icons/SongDefault.vue'
import ImageLoader from '@/utils/ui/mixins/ImageLoader'

@Component({
  components: {
    SongDefault
  }
})
export default class MusicBar extends mixins(Colors, ImageLoader) {
  @Prop({ default: '-' })
  title!: string

  @Prop({ default: () => [] })
  artists!: string[]

  @Prop({ default: '' })
  private imgSrc!: string

  private forceEmptyImg: boolean = false

  private handleImageError() {
    this.forceEmptyImg = true
  }

  @Watch('imgSrc') onImgSrcChange() {
    this.forceEmptyImg = false
  }
}
</script>

<style lang="sass" scoped>
@import '@/sass/variables.sass'

.coverimg
  height: 56px
  width: 56px
  min-width: 56px
  margin-right: 15px
  border-radius: 10px
  object-fit: cover

.text
  text-align: left
  font-family: 'Proxima Nova'
  font-style: normal
  font-weight: normal
  line-height: 170.19%

.song-title
  font-size: 19.1549px

.song-subtitle
  font-size: 12.2592px
  color: var(--textSecondary)

.text-container
  width: calc( 100% - 56px - 15px )
</style>

function Watch(arg0: string) { throw new Error('Function not implemented.') }
