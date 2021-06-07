import { Youtube } from '@/utils/providers/youtube'
import { VuexModule } from './module'

export class ProviderStore extends VuexModule.With({ namespaced: 'providers' }) {
  public youtubeProvider = new Youtube()
}
