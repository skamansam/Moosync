import { Youtube } from '@/utils/providers/youtube'
import { VuexModule } from './module'
import { Spotify } from '@/utils/providers/spotify';

export class ProviderStore extends VuexModule.With({ namespaced: 'providers' }) {
  public youtubeProvider = new Youtube()
  public spotifyProvider = new Spotify()
}
