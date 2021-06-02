import { Component } from 'vue-property-decorator'
import Vue from 'vue'
import { vxm } from '@/mainWindow/store'

@Component
export default class ThemeHandler extends Vue {
  private root = document.documentElement
  get rootColors() {
    return vxm.themes.colors
  }

  private setDefaultTheme() {
    vxm.themes.colors = {
      '--primary': '#212121',
      '--secondary': '#282828',
      '--tertiary': '#202730',
      '--textPrimary': '#ffffff',
      '--textSecondary': '#565656',
      '--textInverse': '#000000',
      '--accent': '#65CB88',
      '--divider': 'rgba(79, 79, 79, 0.67)',
    }
  }

  private registerThemeListeners() {
    vxm.themes.$watch('colors', (newColors: { [key: string]: string }) => {
      this.setColorsToRoot(newColors)
    })
  }

  private setColorsToRoot(colors: { [key: string]: string }) {
    for (const key in colors) {
      this.root.style.setProperty(key, colors[key])
    }
  }

  mounted() {
    this.registerThemeListeners()
    this.setDefaultTheme()
  }
}
