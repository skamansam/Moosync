import { Component, Vue } from 'vue-property-decorator'

@Component
export default class ErrorHandler extends Vue {

  protected handlerImageError(err: Error, callback?: (err: Error) => void) {
    this.handlerFileError(err)
    callback && callback(err)
  }

  protected handlerFileError(err: Error) {
    window.FileUtils.scan()
  }
}
