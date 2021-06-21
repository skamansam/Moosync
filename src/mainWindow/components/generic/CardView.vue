<template>
  <div>
    <div class="card mb-2">
      <div class="card-img-top" @contextmenu="emitContext">
        <div class="icon-container">
          <slot name="icon" />
        </div>
        <div class="embed-responsive embed-responsive-1by1">
          <div class="embed-responsive-item">
            <img :src="getImgSrc(imgSrc)" alt="Album Art" class="img-fluid w-100 h-100" />
          </div>
        </div>
      </div>
      <div class="card-body">
        <p :id="id" @contextmenu="emitContext">{{ title }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Colors from '@/utils/ui/mixins/Colors'
import ImageLoader from '@/utils/ui/mixins/ImageLoader'
import { mixins } from 'vue-class-component'
import { Component, Prop, Watch } from 'vue-property-decorator'

@Component({
  components: {}
})
export default class SongDetails extends mixins(Colors, ImageLoader) {
  @Prop({ default: '' })
  private title!: string

  @Prop({ default: '' })
  private subtitle!: string

  @Prop({ default: '' })
  private id!: string

  @Prop({ default: '' })
  private imgSrc!: string

  private forceEmptyImg: boolean = false

  @Watch('imgSrc') onImgSrcChange() {
    this.forceEmptyImg = false
  }

  private emitContext(event: Event) {
    this.$emit('CardContextMenu', event)
  }
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
