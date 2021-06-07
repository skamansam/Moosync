<template>
  <div class="d-flex h-100 w-100">
    <b-table
      class="custom-table-container d-flex h-100"
      table-class="custom-table w-100"
      :items="songList"
      :fields="fields"
      sticky-header
      :no-border-collapse="true"
      selectable
      select-mode="range"
      primary-key="_id"
      :key="test"
      @row-dblclicked="onRowDoubleClicked"
      @row-selected="onRowSelected"
      @row-contextmenu="onRowContext"
    >
      <template #cell(index)="data">{{ data.index + 1 }}</template>

      <template #cell(album)="data">{{ getAlbumName(data.item) }}</template>

      <template #cell(artists)="data">
        {{
        data.item.artists ? data.item.artists.join(", ") : "-"
        }}
      </template>
    </b-table>
  </div>
</template>

<script lang="ts">
import { Song } from '@/models/songs'
import Colors from '@/utils/mixins/Colors'
import { Resizer } from '@/utils/ui/resizer'
import { mixins } from 'vue-class-component'
import { Component, Prop } from 'vue-property-decorator'

@Component({})
export default class SongList extends mixins(Colors) {
  private test: boolean = false
  private lastSelect: string = ''
  private resizer!: Resizer
  private selected: Song[] = []

  @Prop({ default: [] })
  private songList!: Song[]

  @Prop({ default: {} })
  private extrafields!: [{ key: string }]

  private fields: [{ key: string; label?: string; tdClass?: string; thClass?: string }] = [
    { key: 'index', label: 'Sr. No', tdClass: 'index-no-td', thClass: 'index-no-th' },
  ]

  private getAlbumName(data: Song) {
    if (data.album && data.album.album_name) return data.album.album_name
    return '-'
  }

  created() {
    this.fields.push(...this.extrafields)
  }

  mounted() {
    this.resizer = new Resizer(document)
    window.WindowUtils.setMainWindowResizeListener(this.rerenderTable)

    var doit: NodeJS.Timeout
    window.onresize = () => {
      this.rerenderTable()
      clearTimeout(doit)
      // Add grips only after there is no resizeing event for 100ms
      doit = setTimeout(() => this.resizer.addGrips(), 100)
    }
  }

  private onRowContext(item: Song, index: number, event: Event) {
    this.$emit('onRowContext', event, this.selected.length > 1 ? this.selected : [item])
  }

  private onRowDoubleClicked(item: Song) {
    this.$emit('onRowDoubleClicked', item)
  }

  private onRowSelected(items: Song[]) {
    this.selected = items
    if (items[items.length - 1] && items[items.length - 1]._id !== this.lastSelect) {
      this.lastSelect = items[items.length - 1]._id!
      this.$emit('onRowSelected', items)
    }
  }

  private sortContent(): void {
    // TODO: Sort content without b-table sort since we have table resizers
  }

  // For some reason table isn't rerendered on window size change through maximize and minimize functions
  private rerenderTable() {
    this.test = !this.test
  }
}
</script>

<style lang="sass">
.index-no-td
  padding: 20px 0 20px 15px !important

.index-no-th > div
  padding-left: 10px

.custom-table
  color: var(--textPrimary) !important
  table-layout: fixed
  margin-right: 10px
  min-width: 10px

.custom-table > thead > tr > th
  background-color: var(--primary) !important
  color: var(--textPrimary) !important
  border-top: 0px !important
  border-bottom: 1px solid var(--textSecondary) !important
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
  user-select: none
  font-family: 'Proxima Nova'
  overflow: hidden

.custom-table > tbody > tr > td > div
  font-size: 16px
  line-height: 170.19%

.custom-table > thead > tr > th > div
  font-weight: bold
  font-size: 18px
  line-height: 167.19%

.custom-table > tbody > tr
  &:focus
    outline: 1px solid var(--accent)

table.b-table > thead > tr > th[aria-sort="ascending"],
table.b-table > tfoot > tr > th[aria-sort="ascending"]
  background-image: none !important
  padding-right: 0px !important

table.b-table > thead > tr > th[aria-sort="descending"],
table.b-table > tfoot > tr > th[aria-sort="descending"]
  background-image: none !important
  padding-right: 0px !important

.custom-table-container
  transition: color .3s ease
  color: rgba(0, 0, 0, 0)
  max-height: calc(100% - 15px) !important
  max-width: 100%
  overflow-x: hidden
  overflow-y: auto
  margin-bottom: 0 !important

.custom-table-container > table
  max-width: 100%

.custom-table-container
  &::-webkit-scrollbar-thumb
    background: var(--textPrimary)
    border: 10px solid var(--primary)
  &::-webkit-scrollbar-track
    background: var(--primary) !important
</style>
