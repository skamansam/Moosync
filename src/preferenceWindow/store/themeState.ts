import Themes from '@/commonStore/themeState'
import store from '.'

export const ThemesModule = new Themes({ store, name: 'themes' })
