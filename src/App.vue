<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <Canvas v-bind:src="video_src" nx=3 ny=3  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Canvas from './components/Canvas.vue';

import video from './assets/beach.jpg';

export default defineComponent({
  name: 'App',
  components: {
    Canvas
  },
  data(){
    return {
      video_src: video,
    }
  }
})
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
