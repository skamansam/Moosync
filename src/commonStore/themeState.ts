import { createModule } from 'vuex-class-component'

const VuexModule = createModule({
  namespaced: 'themes',
})

export default class ThemeStore extends VuexModule {
  public colors: { [key: string]: string } = {}
}
