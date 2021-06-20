import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

@Component
export default class ImgLoader extends Vue {
  @Prop({ default: '' })
  private imgSrc!: string

  @Watch('imgSrc') onImgSrcChange() {
    this.forceEmptyImg = false
  }

  public forceEmptyImg: boolean = false

  get ImgSrc() {
    if (this.imgSrc) {
      if (this.imgSrc.startsWith('http')) return this.imgSrc
      else return 'media://' + this.imgSrc
    }
    return ''
  }
}
