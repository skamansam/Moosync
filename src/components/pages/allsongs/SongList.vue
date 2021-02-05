<template>
  <b-table
    class="custom-table-container d-flex w-100"
    table-class="custom-table"
    :items="songList"
    :fields="fields"
    sticky-header
    :no-border-collapse="true"
    selectable
    select-mode="single"
    primary-key="title"
    :key="test"
    @row-dblclicked="onRowDoubleClicked"
    @row-selected="onRowSelected"
  >
    <template #cell(index)="data">
      {{ data.index + 1 }}
    </template>

    <template #cell(artists)="data">
      {{ data.item.artists.length != 0 ? data.item.artists.join(', ') : '-' }}
    </template>
  </b-table>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { ipcRenderer } from 'electron'
// eslint-disable-next-line no-unused-vars
import { Song } from '@/models/songs'
import { PlayerModule } from '@/store/playerState'
import { EventBus, IpcEvents } from '@/services/ipc/main/constants'
import { IpcRendererHolder } from '@/services/ipc/renderer'

interface ResizerElements {
  thElm: HTMLElement | undefined
  thNext: HTMLElement | undefined
  startOffset: number | undefined
  ogWidth: number | undefined
  nextOgWidth: number | undefined
}

class Resizer {
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

@Component({
  components: {},
})
export default class SongList extends Vue {
  private test: boolean = false
  private lastSelect: string = ''
  private resizer!: Resizer
  private IpcHolder = new IpcRendererHolder(ipcRenderer)
  private songList: Song[] = []
  private fields = [
    { key: 'index', label: 'Sr. No', tdClass: 'index-no-td', thClass: 'index-no-th' },
    { key: 'title' },
    { key: 'album' },
    { key: 'artists' },
  ]

  mounted() {
    this.resizer = new Resizer(document)
    window.addEventListener('resize', this.rerenderTable)
    this.requestSongs()
  }

  private onRowDoubleClicked(item: Song) {
    PlayerModule.pushInQueue(item)
  }

  private onRowSelected(items: Song[]) {
    if (items[0] && items[0]._id !== this.lastSelect) {
      this.lastSelect = items[0]._id!
      this.fetchCover(items[0])
    }
  }

  private sortContent(): void {
    // TODO: Sort content without b-table sort since we have table resizers
  }

  // For some reason table isn't rerendered on window size change
  private rerenderTable() {
    this.test = !this.test
    this.$nextTick().then(() => {
      this.resizer.addGrips()
    })
  }

  private async requestSongs() {
    this.IpcHolder.send<Song[]>(IpcEvents.GET_ALL_SONGS, { responseChannel: IpcEvents.GOT_ALL_SONGS }).then((data) => {
      this.songList = data
    })
  }

  private async fetchCover(song: Song) {
    this.$root.$emit(EventBus.SONG_SELECTED, song)
  }
}
</script>

<style lang="sass">
@import '@/sass/variables.sass'

.custom-table
  color:  var(--textPrimary) !important
  table-layout: fixed
  margin-right: 10px
  min-width: 10px
  overflow-y: hidden

.custom-table > thead > tr > th
  background-color: var(--primary) !important
  color:  var(--textPrimary) !important
  border-top: 0px !important
  border-bottom: 1px solid  var(--textSecondary) !important
  text-align: left
  padding: 12px 0 12px 0 !important

.custom-table > tbody > tr > td
  border-top: 0px !important
  border-bottom: 1px solid var(--textSecondary) !important
  text-align: left
  padding: 20px 0 20px 0

.custom-table > tbody > tr > td , .custom-table > thead > tr > th > div
  white-space: nowrap
  text-overflow: ellipsis
  overflow: hidden
  user-select: none
  font-family: 'Proxima Nova'

.custom-table > tbody > tr > td > div
  font-size: 16px
  line-height: 170.19%

.custom-table > thead > tr > th > div
  font-weight: bold
  font-size: 18px
  line-height: 167.19%

table.b-table > thead > tr > th[aria-sort="ascending"],
table.b-table > tfoot > tr > th[aria-sort="ascending"]
  background-image: none !important
  padding-right: 0px !important

table.b-table > thead > tr > th[aria-sort="descending"],
table.b-table > tfoot > tr > th[aria-sort="descending"]
  background-image: none !important
  padding-right: 0px !important

.index-no-td
  padding: 20px 0 20px 15px !important

.index-no-th > div
  padding-left: 10px

.custom-table-container
  transition: color .3s ease
  color: rgba(0, 0, 0, 0)
  max-height: calc( 100vh - 6.5rem - 30px - 30px) !important
  overflow-y: auto
  overflow-x: hidden

.custom-table-container:hover
  color: var(--textPrimary)

*::-webkit-scrollbar,
*::-webkit-scrollbar-thumb
  width: 26px
  border-radius: 13px
  background-clip: padding-box
  border: 10px solid transparent


*::-webkit-scrollbar-thumb
  box-shadow: inset 0 0 0 10px

.custom-table-container::-webkit-scrollbar-track
  margin-top: calc( 0.75rem * 2 + 18px)
  background: none

.custom-table-container > table
  width: 100%
</style>
