<template>
  <div id="app">
    <img
      alt="Vue logo"
      src="./assets/logo.png"
    >
    <router-link to="/broadcast">
      Broadcaster
    </router-link>
    <router-link to="/watch">
      Watcher
    </router-link>

    <router-view />
    <!-- <Broadcaster /> -->
  </div>
</template>

<script>
// import Broadcaster from "./components/Broadcaster.vue";

export default {
  name: 'Moosync',
  components: {
    // Broadcaster,
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
