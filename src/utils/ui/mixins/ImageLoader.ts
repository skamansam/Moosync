import { Component, Vue } from 'vue-property-decorator'

@Component
export default class ImgLoader extends Vue {

  private getImgSrc(imgSrc: string | null | undefined) {
    if (imgSrc) {
      if (imgSrc.startsWith('http')) return imgSrc
      else return 'media://' + imgSrc
    }
    return ''
  }
}
