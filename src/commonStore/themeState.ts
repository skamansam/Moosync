import { Module, Mutation, VuexModule } from 'vuex-class-modules'

import store from '.'

@Module
export default class Themes extends VuexModule {
  private colors: { [key: string]: string } = {}

  get rootVars() {
    return this.colors
  }

  @Mutation
  setRootVars(colors: { [key: string]: string }) {
    this.colors = colors
  }
}

export const ThemesModule = new Themes({ store, name: 'themes' })
