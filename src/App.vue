<template>
  <div id="app" :style="themes">
    <MainComponent></MainComponent>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import MainComponent from '@/components/MainComponent.vue'
// eslint-disable-next-line no-unused-vars
import { colors, ThemesModule } from './store/themeState'

@Component({
  components: {
    MainComponent,
  },
})
export default class App extends Vue {
  private themes = {
    '--primary': this.rootColors.primary,
    '--secondary': this.rootColors.secondary,
    '--tertiary': this.rootColors.tertiary,
    '--quaternary': this.rootColors.quaternary,
    '--textPrimary': this.rootColors.textPrimary,
    '--textPrimaryTransparent': this.rootColors.textPrimaryTransparent,
    '--textSecondary': this.rootColors.textSecondary,
    '--accentPrimary': this.rootColors.accentPrimary,
  }
  private root = document.documentElement
  // Themes
  get rootColors() {
    return ThemesModule.rootVars
  }

  private setThemes(colors: colors) {
    this.themes = {
      '--primary': colors.primary,
      '--secondary': colors.secondary,
      '--tertiary': colors.tertiary,
      '--quaternary': colors.quaternary,
      '--textPrimary': colors.textPrimary,
      '--textPrimaryTransparent': colors.textPrimaryTransparent,
      '--textSecondary': colors.textSecondary,
      '--accentPrimary': colors.accentPrimary,
    }
  }

  @Watch('themes', { immediate: true, deep: true })
  onThemeChanged() {
    this.root.style.setProperty('--primary', this.rootColors.primary)
    this.root.style.setProperty('--secondary', this.rootColors.secondary)
  }

  mounted() {
    ThemesModule.$watch(
      (themesModule) => themesModule.rootVars,
      async (newColors: colors) => {
        this.setThemes(newColors)
      }
    )
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  background: var(--primary);
  color: var(--textPrimary);
  width: 100%;
  height: 100%;
  /* margin-top: 60px; */
}

body {
  background-color: var(--primary) !important;
  color: var(--textPrimary) !important;
}
</style>
