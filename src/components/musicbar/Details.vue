<template>
  <b-container fluid class="d-flex flex-column h-100">
    <b-row class="flex-grow-1 align-items-center">
      <b-col cols="2" class="d-flex justify-content-center">
        <img class="coverimg" src="@/assets/logo.png" alt="cover img" />
      </b-col>
      <b-col cols="10">
        <div class="text song-title text-truncate">Idhar Ayega tera Gaana ka naam</div>
        <div class="text song-subtitle text-truncate">Khush Adnani - World bike tour 2021</div>
      </b-col>
    </b-row>
  </b-container>
</template>

<style lang="sass" scoped>
@import '@/sass/variables.sass'

.coverimg
  height: 56px
  width: 56px

.text
  text-align: left
  font-family: 'Proxima Nova'
  font-style: normal
  font-weight: normal
  line-height: 170.19%

.song-title
  font-size: 19.1549px
  color: $text-primary

.song-subtitle
  font-size: 12.2592px
  color: $text-secondary
</style>
