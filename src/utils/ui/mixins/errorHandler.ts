import { Component, Vue } from 'vue-property-decorator'

@Component
export default class ErrorHandler extends Vue {

  protected handlerImageError(err: ErrorEvent, callback?: (err: ErrorEvent) => void) {
    this.handlerFileError(err)
    callback && callback(err)
  }

  protected handlerFileError(err: ErrorEvent) {
    // TODO: Need some kind of specific guidelines when to start scanning
    // if (!(err?.target as HTMLImageElement)?.src?.startsWith('http'))
    // window.FileUtils.scan()
  }
}
