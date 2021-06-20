<template>
  <div class="d-flex justify-content-end">
    <div class="slider-container d-flex">
      <input
        type="range"
        min="0"
        max="100"
        class="slider w-100 align-self-center test"
        v-bind:style="{
          background: ComputedGradient
        }"
        id="myRange"
        aria-label="volume"
        v-model="volume"
      />
    </div>
    <div class="volume-icon">
      <VolumeIcon />
    </div>
    <div>
      <div class="expand-icon ml-auto" :class="{ open: sliderOpen }" @click="emitToggleSlider">
        <ExpandIcon />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import VolumeIcon from '@/mainWindow/components/icons/Volume.vue'
import ExpandIcon from '@/mainWindow/components/icons/Expand.vue'
import Colors from '@/utils/ui/mixins/Colors'
import { mixins } from 'vue-class-component'
import { vxm } from '@/mainWindow/store'

@Component({
  components: {
    VolumeIcon,
    ExpandIcon
  }
})
export default class MusicBar extends mixins(Colors) {
  // TODO: Load last used volume

  private sliderOpen: boolean = false

  get volume() {
    return vxm.player.volume
  }

  set volume(value: number) {
    vxm.player.volume = value
  }

  private emitToggleSlider() {
    this.sliderOpen = !this.sliderOpen
    this.$emit('onToggleSlider', this.sliderOpen)
  }

  get ComputedGradient(): string {
    return `linear-gradient(90deg, ${this.rootColors['--accent']} 0%, ${this.rootColors['--accent']} ${this.volume}%, ${this.rootColors['--textSecondary']} 0%)`
  }
}
</script>

<style lang="sass" scoped>
@import '@/sass/variables.sass'

.slider-container
  padding-right: 20px

.slider
  -webkit-appearance: none
  height: 2px
  outline: none

.slider::-webkit-slider-thumb
  -webkit-appearance: none
  appearance: none
  width: 12px
  height: 12px
  border-radius: 50%
  background: var(--accent)

.slider::-ms-fill-upper
  background-color: var(--primary)

.volume-icon
  height: 22px
  width: 22px
  margin-right: 15px

.expand-icon
  height: 27px
  width: 18px
  transition: transform 0.2s linear

.open
  transform: rotate(180deg)

.test
  min-width: 0
</style>
