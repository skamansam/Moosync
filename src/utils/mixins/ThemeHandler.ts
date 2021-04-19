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
        '--accentPrimary': '#65CB88',
        '--divider': 'rgba(79, 79, 79, 0.67)',
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
}
