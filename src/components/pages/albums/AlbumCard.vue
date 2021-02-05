<template>
  <div>
    <b-card
      :title="title"
      :sub-title="subtitle"
      :img-src="imgSrc ? 'media://' + imgSrc : ''"
      img-alt="Album Art"
      img-top
      class="mb-2 card-body"
    >
    </b-card>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  components: {},
})
export default class SongDetails extends Vue {
  @Prop({ default: '' })
  private title!: string

  @Prop({ default: '' })
  private subtitle!: string

  @Prop({ default: '' })
  private imgSrc!: string
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
</style>
