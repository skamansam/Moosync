import { Component, Vue } from 'vue-property-decorator'

import { ThemesModule } from '@/commonStore/themeState'

@Component
export default class Colors extends Vue {
  get rootColors() {
    return ThemesModule.rootVars
  }
}
