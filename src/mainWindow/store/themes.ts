import { VuexModule } from './module';

export class ThemeStore extends VuexModule.With({ namespaced: 'themes' }) {
  private _songView: songMenu = 'compact'
  private _sortBy: sortOptions = { type: 'date', asc: true }

  get sortBy() {
    return this._sortBy
  }

  set sortBy(options: sortOptions) {
    this._sortBy = options
  }

  get songView() {
    return this._songView
  }

  set songView(menu: songMenu) {
    this._songView = menu
  }
}
