import { Component, Vue } from 'vue-property-decorator'

@Component
export default class ErrorHandler extends Vue {

  protected handlerImageError(err: Error, callback?: (err: Error) => void) {
    console.log('type:', err)
    this.handlerFileError(err)
    callback && callback(err)
  }

  protected handlerFileError(err: Error) {
    if (err.name === 'NotSupportedError') {
      window.FileUtils.scan()
    }
  }
}
