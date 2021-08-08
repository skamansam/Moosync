import { Component } from 'vue-property-decorator'
import Vue from 'vue'

@Component
export default class ThemeHandler extends Vue {
  private root = document.documentElement

  // static get defaultTheme() {
  //   return {
  //     primary: '#212121',
  //     secondary: '#282828',
  //     tertiary: '#151515',
  //     textPrimary: '#ffffff',
  //     textSecondary: '#565656',
  //     textInverse: '#000000',
  //     accent: '#65CB88',
  //     divider: 'rgba(79, 79, 79, 0.67)',
  //   }
  // }

  public async setColorsToRoot(theme: ThemeDetails | undefined) {
    const colors = theme?.theme
    if (!colors) {
      this.root.style.cssText = ''
    }
    for (const key in colors) {
      this.root.style.setProperty(`--${key}`, colors[key as keyof ThemeItem])
    }
  }

  public fetchThemeFromID() {
    window.ThemeUtils.getActiveTheme().then(theme => this.setColorsToRoot(theme))
  }

  mounted() {
    this.fetchThemeFromID()
  }
}
