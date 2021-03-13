<template>
  <div>
    <b-card :title="title" :sub-title="subtitle" :img-src="ImgSrc" img-alt="Album Art" img-top class="mb-2 card-body">
    </b-card>
  </div>
</template>

<script lang="ts">
import Colors from '@/utils/mixins/Colors'
import ImageLoader from '@/utils/mixins/ImageLoader'
import { mixins } from 'vue-class-component'
import { Component, Prop } from 'vue-property-decorator'

@Component({
  components: {},
})
export default class SongDetails extends mixins(Colors, ImageLoader) {
  @Prop({ default: '' })
  private title!: string

  @Prop({ default: '' })
  private subtitle!: string
}
</script>

<style lang="sass" scoped>
.card-body
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

.card-body > img
  mix-blend-mode: normal
  border-radius: 16px
  height: 100%
</style>
