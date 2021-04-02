import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class ImgLoader extends Vue {
  @Prop({ default: '' })
  private imgSrc!: string

  get ImgSrc() {
    if (this.imgSrc) {
      if (this.imgSrc.startsWith('http')) return this.imgSrc
      else return 'media://' + this.imgSrc
    }
    return ''
  }
}
