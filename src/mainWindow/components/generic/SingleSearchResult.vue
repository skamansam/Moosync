<template>
  <b-container fluid class="single-result-container" @contextmenu.prevent="emitContextMenu($event)">
    <b-row align-h="around" class="no-gutters">
      <b-col cols="1" class="img-container justify-content-around ms-auto" @click="emitImgClick">
        <div class="play-button me-auto justify-content-center d-flex align-items-center">
          <div class="play-icon"><Play2 /></div>
        </div>
        <img ref="cover" class="coverimg me-auto d-flex align-items-center" alt="cover img" :src="getCoverImg()" />
      </b-col>
      <b-col class="text-container text-truncate my-auto">
        <b-link class="song-title text-truncate" @click="emitTitleClick">{{ title }}</b-link>
        <div class="song-subtitle text-truncate">{{ subtitle }}</div>
      </b-col>
      <b-col cols="2" v-if="showButtons" class="buttons"><div></div></b-col>
    </b-row>
    <b-row v-if="divider" class="divider-row d-flex no-gutters">
      <div class="divider" />
    </b-row>
    <b-row v-if="!divider" class="no-gutters">
      <div class="placeholder" />
    </b-row>
  </b-container>
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

  @Prop({ default: false })
  showButtons!: boolean

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

  private emitContextMenu(event: Event) {
    this.$emit('onContextMenu', event, this.id)
  }
}
</script>

<style lang="sass" scoped>
.result-container
  margin-left: 40px

.img-container
  position: relative
  width: 56px
  height: 56px
  margin-right: 20px
  &:hover
    .coverimg
      opacity: 0.2
    .play-button
      opacity: 1

.play-button
  position: absolute
  opacity: 0
  height: 56px
  width: 56px

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
  width: 100%

.single-result-container
  margin-top: 13px

.placeholder
  height: 13px

.divider-row
  margin-top: 13px
</style>
