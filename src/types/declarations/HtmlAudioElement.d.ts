interface ExtendedHtmlAudioElement extends HTMLAudioElement {
  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/captureStream
  captureStream(frameRate?: number): MediaStream
}
