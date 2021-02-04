<template>
  <div class="h-100 d-flex">
    <b-form-input class="searchbar" placeholder="Search..." type="text" debounce="500" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class Sidebar extends Vue {}
</script>

<style lang="sass" scoped>
.searchbar
  border-radius: 58px
  color: var(--textSecondary)
  background: var(--quaternary)
  box-shadow: none
  border: none
  transition: background 0.3s cubic-bezier(0.39, 0.58, 0.57, 1)

.searchbar::-webkit-input-placeholder
  color: var(--textSecondary)

.searchbar:focus
  background: #000000
  outline: 0
  box-shadow: none
</style>
