<template>
  <div>
    <div class="card mb-2">
      <div class="card-img-top" @contextmenu="emitContext">
        <div class="icon-container">
          <slot name="icon" />
        </div>
        <div class="embed-responsive embed-responsive-1by1">
          <div class="embed-responsive-item">
            <img
              v-if="imgSrc && !forceEmptyImg"
              :src="getImgSrc(imgSrc)"
              alt="Album Art"
              class="img-fluid w-100 h-100"
              @error="handlerImageError(arguments[0], handleError)"
            />
            <div class="default-icon">
              <slot v-if="!imgSrc || forceEmptyImg" name="defaultCover" />
            </div>
          </div>
        </div>
      </div>
      <div class="card-body">
        <p ref="title" :title="title" :id="id" @contextmenu="emitContext">{{ title }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import ImageLoader from '@/utils/ui/mixins/ImageLoader'
import { mixins } from 'vue-class-component'
import { Component, Prop, Ref, Watch } from 'vue-property-decorator'
import ErrorHandler from '@/utils/ui/mixins/errorHandler'

@Component({
  components: {}
})
export default class SongDetails extends mixins(ImageLoader, ErrorHandler) {
  @Prop({ default: '' })
  private title!: string

  @Prop({ default: '' })
  private subtitle!: string

  @Prop({ default: '' })
  private id!: string

  @Prop({ default: '' })
  private imgSrc!: string

  @Ref('title')
  private titleText!: HTMLParagraphElement

  private forceEmptyImg: boolean = false

  @Watch('imgSrc') onImgSrcChange() {
    this.forceEmptyImg = false
  }

  private handleError() {
    this.forceEmptyImg = true
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

.card-body > p, .card-body > p
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
  font-weight: bold
  font-size: 20px

.default-icon
  svg
    border-radius: 16px


img
  mix-blend-mode: normal
  border-radius: 16px
  height: 100%
  width: 100%
  object-fit: cover

.card
  background-color: transparent

.card-body
  padding: 12px

.icon-container
  z-index: 1
  position: absolute
  top: 10px
  left: 10px
  svg
    width: 24px
    height: 24px
</style>
