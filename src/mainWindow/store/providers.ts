import { Youtube } from '@/utils/ui/providers/youtube'
import { VuexModule } from './module'
import { Spotify } from '@/utils/ui/providers/spotify';

export class ProviderStore extends VuexModule.With({ namespaced: 'providers' }) {
  public youtubeProvider = new Youtube()
  public spotifyProvider = new Spotify()
}
