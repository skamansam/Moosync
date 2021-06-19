<template>
  <div>
    <div class="card mb-2">
      <div class="card-img-top">
        <div class="icon-container">
          <slot name="icon" />
        </div>
        <div class="embed-responsive embed-responsive-1by1">
          <div class="embed-responsive-item">
            <img :src="ImgSrc" alt="Album Art" class="img-fluid w-100 h-100" />
          </div>
        </div>
      </div>
      <div class="card-body">
        <p>{{ title }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Colors from '@/utils/mixins/Colors'
import ImageLoader from '@/utils/mixins/ImageLoader'
import { mixins } from 'vue-class-component'
import { Component, Prop } from 'vue-property-decorator'

@Component({
  components: {}
})
export default class SongDetails extends mixins(Colors, ImageLoader) {
  @Prop({ default: '' })
  private title!: string

  @Prop({ default: '' })
  private subtitle!: string
}
</script>

<style lang="sass" scoped>
.card
  background-color: transparent
  border: none
  text-align: left
  padding-left: 0
  padding-right: 0
  max-width: 200px

.card-body > p, .card-body > h4
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
  font-family: Proxima Nova
  font-style: normal
  font-weight: bold
  font-size: 24px
  line-height: 29px

img
  mix-blend-mode: normal
  border-radius: 16px
  height: 100%
  width: 100%
  object-fit: cover

.card
  background-color: transparent

.icon-container
  z-index: 1
  position: absolute
  top: 10px
  left: 10px
  svg
    width: 24px
    height: 24px
</style>
