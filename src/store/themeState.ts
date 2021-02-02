import { VuexModule, Module, Mutation, Action } from 'vuex-class-modules'
import store from '.'

export interface colors {
  primary: string
  secondary: string
  tertiary: string
  quaternary: string
  textPrimary: string
  textPrimaryTransparent: string
  textSecondary: string
  accentPrimary: string
}

@Module
class Themes extends VuexModule {
  private colors: colors = {
    primary: '#212121',
    secondary: '#282828',
    tertiary: '#202730',
    quaternary: '#404040',
    textPrimary: '#ffffff',
    textPrimaryTransparent: '#ffffff03',
    textSecondary: '#565656',
    accentPrimary: '#65CB88',
  }

  get rootVars() {
    return this.colors
  }

  @Mutation
  setRootVars(colors: colors) {
    this.colors = colors
  }
}

export const ThemesModule = new Themes({ store, name: 'themes' })
