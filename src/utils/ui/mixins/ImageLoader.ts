import { Component, Vue } from 'vue-property-decorator'

@Component
export default class ImgLoader extends Vue {

  protected getValidImageLow(song: Song | null | undefined) {
    return song?.song_coverPath_low ?? song?.album?.album_coverPath_low
  }

  protected getValidImageHigh(song: Song | null | undefined) {
    return song?.song_coverPath_high ?? song?.album?.album_coverPath_high
  }

  protected getImgSrc(imgSrc: string | null | undefined) {
    if (imgSrc) {
      if (imgSrc.startsWith('http') || imgSrc.startsWith('media')) return imgSrc
      else return 'media://' + imgSrc
    }
    return ''
  }
}
