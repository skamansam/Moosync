<template>
  <div id="app" :style="rootColors">
    <MainComponent></MainComponent>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import MainComponent from '@/components/MainComponent.vue'

import { ThemesModule } from './store/themeState'

@Component({
  components: {
    MainComponent,
  },
})
export default class App extends Vue {
  private root = document.documentElement
  get rootColors() {
    return ThemesModule.rootVars
  }

  private setDefaultTheme() {
    ThemesModule.setRootVars({
      '--primary': '#212121',
      '--secondary': '#282828',
      '--tertiary': '#202730',
      '--quaternary': '#404040',
      '--textPrimary': '#ffffff',
      '--textPrimaryTransparent': '#ffffff03',
      '--textSecondary': '#565656',
      '--accentPrimary': '#65CB88',
    })
  }

  mounted() {
    ThemesModule.$watch(
      (themesModule) => themesModule.rootVars,
      async (newColors: { [key: string]: string }) => {
        this.root.style.setProperty('--primary', newColors['--primary'])
      }
    )
    this.setDefaultTheme()
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
