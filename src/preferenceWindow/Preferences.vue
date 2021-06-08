<template>
  <div id="app" :style="rootColors">
    <Titlebar windowType="preference-window" />
    <div class="content">
      <router-view></router-view>
    </div>
    <div class="footer-buttons">
      <b-button v-on:click="closeWindow">Close</b-button>
      <b-button v-on:click="writePreferences">Apply</b-button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import Titlebar from '@/commonComponents/Titlebar.vue'
import { vxm } from '@/preferenceWindow/store'

@Component({
  components: {
    Titlebar
  }
})
export default class App extends Vue {
  created() {
    this.loadPreferences()
  }

  private root = document.documentElement
  get rootColors() {
    return vxm.themes.colors
  }

  private setDefaultTheme() {
    if (!vxm.themes.colors['--primary'])
      vxm.themes.colors = {
        '--primary': '#212121',
        '--secondary': '#282828',
        '--tertiary': '#202730',
        '--lightPrimary': '#404040',
        '--darkPrimary': '#202224',
        '--textPrimary': '#ffffff',
        '--textPrimaryTransparent': '#ffffff03',
        '--textSecondary': '#565656',
        '--accent': '#65CB88',
        '--divider': 'rgba(79, 79, 79, 0.67)'
      }
  }

  private registerThemeListeners() {
    vxm.themes.$watch('colors', (newColors: { [key: string]: string }) => {
      this.root.style.setProperty('--primary', newColors['--primary'])
    })
  }

  mounted() {
    this.registerThemeListeners()
    this.setDefaultTheme()
  }

  private loadPreferences() {
    window.PreferenceUtils.load().then((data) => {
      vxm.preferences.setPreferences(data)
    })
  }

  private closeWindow() {
    window.WindowUtils.closePreferenceWindow()
  }

  private async writePreferences() {
    await window.PreferenceUtils.save(vxm.preferences.preferences)
    if (vxm.preferences.pathsChanged) {
      Vue.nextTick(() => window.FileUtils.scan())
    }
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
  /* margin-top: 60px */
}

body {
  background-color: var(--primary) !important;
  color: var(--textPrimary) !important;
}

.content {
  margin: 0 2rem 0 2rem;
  max-height: calc(100% - 32px);
}

.footer-buttons {
  position: absolute;
  bottom: 0;
  right: 0;
}
</style>
