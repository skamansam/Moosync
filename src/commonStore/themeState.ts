import { Module, Mutation, VuexModule } from 'vuex-class-modules'

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
