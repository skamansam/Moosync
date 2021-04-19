import { vxm } from '@/mainWindow/store'
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class Colors extends Vue {
  get rootColors() {
    return vxm.themes.colors
  }
}
