<template>
  <div class="d-flex w-100">
    <b-img
      fluid
      ref="cover"
      class="coverimg"
      v-if="ImgSrc || coverBlobBase64"
      :src="!coverBlobBase64 ? ImgSrc : coverBlobBase64"
      alt="cover art"
    />
    <Record v-if="!(ImgSrc || coverBlobBase64)" class="coverimg" />
    <div class="text-container">
      <div class="text song-title text-truncate">{{ title }}</div>
      <div class="text song-subtitle text-truncate">
        {{ artists ? artists.join(', ') : '-' }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Colors from '@/utils/mixins/Colors'
import { mixins } from 'vue-class-component'
import { Component, Prop, Ref } from 'vue-property-decorator'
import Record from '@/mainWindow/components/icons/Record.vue'
import ImageLoader from '@/utils/mixins/ImageLoader'

@Component({
  components: {
    Record,
  },
})
export default class MusicBar extends mixins(Colors, ImageLoader) {
  @Prop({ default: '-' })
  title!: string

  @Prop({ default: () => [] })
  artists!: string[]

  @Prop({ default: null })
  private coverBlob!: Blob | null

  get coverBlobBase64() {
    if (this.coverBlob) {
      return URL.createObjectURL(this.coverBlob)
    }
    return null
  }

  @Ref('cover')
  private imageElement!: HTMLImageElement
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


.text
  text-align: left
  font-family: 'Proxima Nova'
  font-style: normal
  font-weight: normal
  line-height: 170.19%

.song-title
  font-size: 19.1549px
  color:  var(--textPrimary)

.song-subtitle
  font-size: 12.2592px
  color:  var(--textSecondary)

.text-container
  width: calc( 100% - 56px - 15px )
</style>
