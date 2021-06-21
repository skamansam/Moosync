<template>
  <b-container fluid class="w-100">
    <b-row class="d-flex h-100 no-gutters">
      <b-col cols="2" class="d-flex h-100 image-container">
        <b-img
          v-if="(getImgSrc(imgSrc) || getImgSrc(defaultImgSrc)) && !forceEmptyImg"
          class="image h-100 w-100"
          :src="getImgSrc(imgSrc) ? getImgSrc(imgSrc) : getImgSrc(defaultImgSrc)"
          @error="handleImageError"
        />
        <Record v-if="!getImgSrc(imgSrc) || forceEmptyImg" class="h-100 image" />
      </b-col>
      <b-col class="text-container text-truncate">
        <div class="title text-truncate">{{ currentTitle ? currentTitle : defaultTitle }}</div>
        <div class="subtitle text-truncate">{{ currentsubTitle ? currentsubTitle : defaultsubTitle }}</div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import Colors from '@/utils/ui/mixins/Colors'
import { mixins } from 'vue-class-component'
import { Component, Prop, Watch } from 'vue-property-decorator'
import Record from '@/mainWindow/components/icons/Record.vue'
import ImageLoader from '@/utils/ui/mixins/ImageLoader'

@Component({
  components: {
    Record
  }
})
export default class SongDetails extends mixins(Colors, ImageLoader) {
  @Prop({ default: '' })
  private currentTitle!: string

  @Prop({ default: '' })
  private currentsubTitle!: string

  @Prop({ default: '' })
  private imgSrc!: string

  @Prop({ default: '' })
  private defaultTitle!: string

  @Prop({ default: '' })
  private defaultsubTitle!: string

  @Prop({ default: '' })
  private defaultImgSrc!: string

  private handleImageError() {
    this.forceEmptyImg = true
  }

  @Watch('imgSrc') onImgSrcChange() {
    this.forceEmptyImg = false
  }

  public forceEmptyImg: boolean = false
}
</script>

<style lang="sass">
@import '@/sass/variables.sass'
@import "~bootstrap/scss/mixins"

.image
  border-radius: 25px
  object-fit: cover

.image-container
  max-width: 170px

.text-container > .b-overlay > .bg-dark
  background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.58), rgba(0, 0, 0, 0.58)), radial-gradient(50% 50% at 50% 50%, rgba(255, 255, 255, 0) 0%, rgba(0, 0, 0, 0.2) 100%) !important
  background-color: #00000000 !important

.text-over
  font-family: 'Proxima Nova'
  text-align: left
  margin-left: 15px

.text-container
  margin-left: 15px
  overflow: hidden

.title
  font-size: 24px
  text-align: left

.dummy
  margin-top: 75%

.subtitle
  font-weight: 250
  text-align: left
  font-size: 14px
</style>
