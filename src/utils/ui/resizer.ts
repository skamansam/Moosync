interface ResizerElements {
  thElm: HTMLElement | undefined
  thNext: HTMLElement | undefined
  startOffset: number | undefined
  ogWidth: number | undefined
  nextOgWidth: number | undefined
}

export class Resizer {
  private resizer: ResizerElements = {
    thElm: undefined,
    thNext: undefined,
    startOffset: undefined,
    ogWidth: undefined,
    nextOgWidth: undefined,
  }

  private document: Document

  constructor(document: Document) {
    this.document = document
    this.addGrips()
    this.registerResizerListeners()
  }

  private registerResizerListeners() {
    this.document.addEventListener('mouseup', () => {
      this.resizer = {
        thElm: undefined,
        thNext: undefined,
        startOffset: undefined,
        ogWidth: undefined,
        nextOgWidth: undefined,
      }
    })
    this.document.addEventListener('mousemove', (e: MouseEvent) => this.calculateColumnWidth(e.pageX))
  }

  private setResizeElements(elements: NodeListOf<Element>, i: number, th: HTMLElement, pos: number) {
    this.resizer.thElm = th
    this.resizer.thNext = (elements[i + 1] as unknown) as HTMLElement
    this.resizer.ogWidth = this.cutPx(th.style.width)
    this.resizer.nextOgWidth = this.cutPx(this.resizer.thNext.style.width)
    this.resizer.startOffset = pos
  }

  private calculateColumnWidth(pos: number) {
    if (this.resizer.thElm) {
      let movement = this.resizer.ogWidth! + (pos - this.resizer.startOffset!)
      if (movement > 0 && this.resizer.thNext) {
        let movementNext = this.resizer.nextOgWidth! - (pos - this.resizer.startOffset!)
        if (movementNext > 0) {
          this.resizer.thNext.style.width = movementNext + 'px'
          this.resizer.thElm.style.width = movement + 'px'
        }
      }
    }
  }

  private cutPx = (str: any) => +str.replace('px', '')

  private getTableGrip(mousedown: (e: MouseEvent) => void): HTMLDivElement {
    var grip = document.createElement('div')
    grip.innerHTML = '&nbsp;'
    grip.style.top = '0'
    grip.style.right = '0'
    grip.style.bottom = '0'
    grip.style.width = '5px'
    grip.style.position = 'absolute'
    grip.style.cursor = 'col-resize'

    grip.addEventListener('mousedown', mousedown)

    return grip
  }

  public addGrips() {
    let elements = this.document.querySelectorAll('table th')

    Array.prototype.forEach.call(elements, (th, i) => {
      //TODO: Save widths
      th.style.width = th.offsetWidth + 'px'

      if (i < 3) {
        let grip = this.getTableGrip((e: MouseEvent) => this.setResizeElements(elements, i, th, e.pageX))
        th.appendChild(grip)
      }
    })
  }
}
