<template>
  <div class="app-container">
    <Canvas :src="video_src" :nx="2" :ny="2" />
    <div class="controll-area"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Canvas from "./view/components/Canvas.vue";

import video from "./assets/beach.jpg";

export default defineComponent({
  name: "App",
  components: {
    Canvas,
  },
  data() {
    return {
      video_src: video,
    };
  },
});
</script>

<style scoped>
.app-container{
  display: grid;
  grid-template-columns: 80% 20%;
}
.controll-area{
  border: 3px dashed;
  max-height: none;
  height: 90vh;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
