import { SpotifyProvider } from '@/utils/ui/providers/spotify';
import { VuexModule } from './module';
import { YoutubeProvider } from '@/utils/ui/providers/youtube';

export class ProviderStore extends VuexModule.With({ namespaced: 'providers' }) {
  public youtubeProvider = new YoutubeProvider()
  public spotifyProvider = new SpotifyProvider()
}
