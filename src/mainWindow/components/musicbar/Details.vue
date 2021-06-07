<template>
  <div class="d-flex w-100">
    <b-img
      fluid
      ref="cover"
      class="coverimg"
      v-if="ImgSrc && !forceEmptyImg"
      :src="ImgSrc"
      alt="cover art"
      @error="handleImageError"
    />
    <Record v-if="!ImgSrc || forceEmptyImg" class="coverimg" />
    <div class="text-container">
      <div class="text song-title text-truncate">{{ title }}</div>
      <div class="text song-subtitle text-truncate">
        {{ artists ? artists.join(", ") : "-" }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Colors from "@/utils/mixins/Colors";
import { mixins } from "vue-class-component";
import { Component, Prop } from "vue-property-decorator";
import Record from "@/mainWindow/components/icons/Record.vue";
import ImageLoader from "@/utils/mixins/ImageLoader";

@Component({
  components: {
    Record,
  },
})
export default class MusicBar extends mixins(Colors, ImageLoader) {
  @Prop({ default: "-" })
  title!: string;

  @Prop({ default: () => [] })
  artists!: string[];

  private handleImageError() {
    this.forceEmptyImg = true;
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
