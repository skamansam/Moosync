import { Component, Vue } from 'vue-property-decorator';

import { toSong } from '@/utils/models/youtube';

@Component
export default class RemoteSong extends Vue {
  public addYTItemsToLibrary(...songs: YoutubeItem[]) {
    window.DBUtils.storeSongs(toSong(...songs))
  }

  public addSongsToLibrary(...songs: Song[]) {
    window.DBUtils.storeSongs(songs)
  }
}