<template>
  <div :class="first ? 'first' : ''">
    <div class="d-flex result-container">
      <div class="img-container" @click="emitImgClick">
        <div class="play-button m-auto d-flex align-items-center justify-content-center">
          <div class="play-icon"><Play2 /></div>
        </div>
        <img ref="cover" class="coverimg" alt="cover img" :src="getCoverImg()" />
      </div>
      <div class="text-container text-truncate my-auto">
        <b-link class="song-title text-truncate" @click="emitTitleClick">{{ title }}</b-link>
        <div class="song-subtitle text-truncate">{{ subtitle }}</div>
      </div>
    </div>
    <div v-if="divider" class="divider" />
    <div v-if="!divider" class="placeholder" />
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import Play2 from '@/mainWindow/components/icons/Play2.vue'
import { mixins } from 'vue-class-component'
import PlayerControls from '@/utils/mixins/PlayerControls'

@Component({
  components: {
    Play2,
  },
})
export default class SingleSearchResult extends mixins(PlayerControls) {
  @Prop({ default: '' })
  coverImg!: string

  @Prop({ default: '' })
  title!: string

  @Prop({ default: '' })
  subtitle!: string

  @Prop({ default: false })
  divider!: boolean

  @Prop({ default: false })
  first!: boolean

  @Prop({ default: null })
  id!: any

  private getCoverImg() {
    if (this.coverImg) {
      if (this.coverImg.startsWith('http')) {
        return this.coverImg
      }
      return `media://${this.coverImg}`
    }
    return ''
  }

  private emitImgClick() {
    this.$emit('imgClick', this.id)
  }

  private emitTitleClick() {
    this.$emit('titleClick', this.id)
  }
}
</script>

<style lang="sass" scoped>
.result-container
  margin-left: 40px

.img-container
  position: relative
  margin-right: 20px
  &:hover
    .coverimg
      opacity: 0.2
    .play-button
      opacity: 1

.play-button
  position: absolute
  opacity: 0
  height: 100%
  width: 100%

.coverimg
  height: 56px
  width: 56px

.text-container
  position: relative
  text-align: left
  font-family: 'Proxima Nova'
  font-style: normal
  font-weight: normal

.song-title
  font-size: 19.1549px
  color:  var(--textPrimary)

.song-subtitle
  font-size: 14.2592px
  color:  var(--textSecondary)

.divider
  border-bottom: 1px solid var(--divider) !important
  margin-top: 13px
  margin-bottom: 13px
  margin-left: 40px
  width: calc(100% - 40px)

.placeholder
  height: 13px

.first
  margin-top: 13px
</style>
