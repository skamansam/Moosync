import Colors from './Colors'
import { Component } from 'vue-property-decorator'
import { ThemesModule } from '@/commonStore/themeState'
import { mixins } from 'vue-class-component'

@Component
export default class ThemeHandler extends mixins(Colors) {
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

  private registerThemeListeners() {
    ThemesModule.$watch(
      (themesModule) => themesModule.rootVars,
      async (newColors: { [key: string]: string }) => {
        this.root.style.setProperty('--primary', newColors['--primary'])
      }
    )
  }

  mounted() {
    this.registerThemeListeners()
    this.setDefaultTheme()
  }
}
