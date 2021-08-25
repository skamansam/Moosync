<template>
  <div>
    <b-container fluid>
      <b-row>
        <PreferenceHeader title="Songs View" tooltip="Customize the colors" class="mb-3" />
      </b-row>
      <b-row no-gutters class="w-100"> </b-row>
      <b-row no-gutters class="w-100">
        <b-col cols="auto" class="mr-3 mb-3">
          <ThemeComponentClassic
            @click.native="setSongView('classic')"
            :selected="isSongView('classic')"
            :id="getRandomID()"
            :colors="currentTheme"
          />
        </b-col>
        <b-col cols="auto" class="mr-3 mb-3">
          <ThemeComponentCompact
            @click.native="setSongView('compact')"
            :selected="isSongView('compact')"
            :id="getRandomID()"
            :colors="currentTheme"
          />
        </b-col>
      </b-row>
      <b-row>
        <PreferenceHeader title="Themes" tooltip="Customize the colors" class="mb-3" />
      </b-row>
      <b-row no-gutters class="w-100"> </b-row>
      <b-row no-gutters class="w-100">
        <b-col cols="auto" class="mr-3 mb-3">
          <component
            :is="themesComponent"
            @click.native="setTheme('default')"
            :selected="isThemeActive('default')"
            :id="getRandomID()"
            :colors="defaultTheme"
          />
        </b-col>
        <b-col cols="auto" class="mr-3 mb-3" v-for="(value, key) in allThemes" :key="key">
          <component
            :is="themesComponent"
            @click.native="setTheme(value.id)"
            :selected="isThemeActive(value.id)"
            :id="value.id"
            :colors="value.theme"
          />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import Vue from 'vue'
import ThemeComponentClassic from '../ThemeComponentClassic.vue'
import { v1 } from 'uuid'
import PreferenceHeader from '../PreferenceHeader.vue'
import ThemeComponentCompact from '../ThemeComponentCompact.vue'

@Component({
  components: {
    ThemeComponentClassic,
    ThemeComponentCompact,
    PreferenceHeader
  }
})
export default class Themes extends Vue {
  private allThemes: { [key: string]: ThemeDetails } = {}

  private async getAllThemes() {
    this.allThemes = (await window.ThemeUtils.getAllThemes()) ?? {}
  }

  private activeTheme: string = 'default'
  private activeView: songMenu = 'compact'

  private get themesComponent() {
    return this.activeView === 'compact' ? 'ThemeComponentCompact' : 'ThemeComponentClassic'
  }

  private get currentTheme() {
    return this.allThemes[this.activeTheme] ?? this.defaultTheme
  }

  private isThemeActive(themeId: string) {
    return themeId === this.activeTheme
  }

  private isSongView(id: songMenu) {
    return id === this.activeView
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
    this.activeTheme = id
    this.$root.$emit('themeChanged')
  }

  private async setSongView(id: songMenu) {
    await window.ThemeUtils.setSongView(id)
    this.activeView = id
  }

  async created() {
    this.activeTheme = (await window.ThemeUtils.getActiveTheme())?.id ?? 'default'
    this.activeView = (await window.ThemeUtils.getSongView()) ?? 'compact'
    await this.getAllThemes()
  }
}
</script>

<style lang="sass" scoped>
.path-selector
  max-width: 750px

.title
  text-align: left
</style>
