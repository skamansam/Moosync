<template>
  <div>
    <b-container fluid>
      <b-row no-gutters class="w-100">
        <b-col cols="auto" class="mr-3">
          <ThemeComponent @click.native="setTheme('default')" :id="getRandomID()" :colors="defaultTheme" />
        </b-col>
        <b-col cols="auto" class="mr-3" v-for="(value, key) in allThemes" :key="key">
          <ThemeComponent @click.native="setTheme(value.id)" :id="value.id" :colors="value.theme" />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import Vue from 'vue'
import ThemeComponent from '../ThemeComponent.vue'
import { v1 } from 'uuid'

@Component({
  components: {
    ThemeComponent
  }
})
export default class Themes extends Vue {
  private allThemes: { [key: string]: ThemeDetails } = {}

  private async getAllThemes() {
    this.allThemes = (await window.ThemeUtils.getAllThemes()) ?? {}
  }

  get defaultTheme() {
    return {
      primary: '#212121',
      secondary: '#282828',
      tertiary: '#151515',
      textPrimary: '#ffffff',
      textSecondary: '#565656',
      textInverse: '#000000',
      accent: '#65CB88',
      divider: 'rgba(79, 79, 79, 0.67)'
    }
  }

  private getRandomID() {
    return v1()
  }

  private async setTheme(id: string) {
    window.ThemeUtils.setActiveTheme(id)
    this.$root.$emit('themeChanged')
  }

  created() {
    this.getAllThemes()
  }
}
</script>

<style lang="sass" scoped>
.path-selector
  max-width: 750px

.title
  text-align: left
</style>
