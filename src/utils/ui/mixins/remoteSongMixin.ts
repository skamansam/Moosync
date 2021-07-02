import { toSong } from '@/utils/models/youtube'
import { Component, Vue } from 'vue-property-decorator'
import AddToLibrary from '@/mainWindow/components/icons/AddToLibrary.vue';


@Component
export default class RemoteSong extends Vue {
  public addYTItemsToLibrary(...songs: YoutubeItem[]) {
    window.DBUtils.storeSongs(toSong(...songs))
  }

  public addSongsToLibrary(...songs: Song[]) {
    window.DBUtils.storeSongs(songs)
  }
}