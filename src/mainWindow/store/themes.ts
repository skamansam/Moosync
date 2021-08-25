import { VuexModule } from './module';

export class ThemeStore extends VuexModule.With({ namespaced: 'themes' }) {
  private _songView: songMenu = 'compact'

  get songView() {
    return this._songView
  }

  set songView(menu: songMenu) {
    console.log(menu)
    this._songView = menu
  }
}
