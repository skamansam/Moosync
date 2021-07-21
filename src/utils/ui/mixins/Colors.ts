import { Component, Vue } from 'vue-property-decorator'

import { vxm } from '@/mainWindow/store'

@Component
export default class Colors extends Vue {
  get rootColors() {
    return vxm.themes.colors
  }
}
