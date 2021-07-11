import { Component, Vue } from 'vue-property-decorator'

@Component
export default class ImgLoader extends Vue {

  protected getValidImage(song: Song) {
    return song.song_coverPath || (song.album ? song.album.album_coverPath : undefined)
  }
  protected getImgSrc(imgSrc: string | null | undefined) {
    if (imgSrc) {
      if (imgSrc.startsWith('http')) return imgSrc
      else return 'media://' + imgSrc
    }
    return ''
  }
}
