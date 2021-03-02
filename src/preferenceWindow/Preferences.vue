<template>
  <div id="app" :style="rootColors">
    <Titlebar />
    <div class="content">
      <router-view></router-view>
    </div>
    <div class="footer-buttons">
      <b-button v-on:click="closeWindow"> Close </b-button>
      <b-button v-on:click="writePreferences"> Apply </b-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import Vue from 'vue'
import { ThemesModule } from '@/preferenceWindow/store/themeState'
import Titlebar from '@/commonComponents/Titlebar.vue'
import { Preferences } from '@/utils/db/constants'
import { ipcRendererHolder } from '@/utils/ipc/renderer'
import { IpcEvents, PreferenceEvents, WindowEvents } from '@/utils/ipc/main/constants'
import { PreferencesModule } from './store/preferences'

@Component({
  components: {
    Titlebar,
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
      '--divider': 'rgba(79, 79, 79, 0.67)',
    })
  }

  created() {
    this.loadPreferences()
  }

  mounted() {
    this.registerThemeListeners()
    this.setDefaultTheme()
  }

  private loadPreferences() {
    ipcRendererHolder
      .send<Preferences>(IpcEvents.PREFERENCES, { type: PreferenceEvents.LOAD_PREFERENCES })
      .then((data) => {
        PreferencesModule.setPreferences(data)
      })
  }

  private closeWindow() {
    ipcRendererHolder.send<void>(IpcEvents.BROWSER_WINDOWS, { type: WindowEvents.CLOSE_PREFERENCE_WINDOW })
  }

  private async writePreferences() {
    return ipcRendererHolder.send<void>(IpcEvents.PREFERENCES, {
      type: PreferenceEvents.SAVE_PREFERENCES,
      params: { preferences: PreferencesModule.preferences },
    })
  }

  private registerThemeListeners() {
    ThemesModule.$watch(
      (themesModule) => themesModule.rootVars,
      async (newColors: { [key: string]: string }) => {
        this.root.style.setProperty('--primary', newColors['--primary'])
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
