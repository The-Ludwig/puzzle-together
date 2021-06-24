<template>
  <canvas id="mycanvas"></canvas>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { puzzleController } from "../../controller/PuzzleController";

// if (import.meta.hot) {
//   import.meta.hot?.dispose((data) => {
//     puzzleController.reset();
//   });
// }

export default defineComponent({
  name: "Canvas",
  props: {
    src: {
      type: String,
      required: true,
    },
    nx: {
      type: Number,
      default: 10,
    },
    ny: {
      type: Number,
      default: 10,
    },
    con_percentage: {
      type: Number,
      default: 0.3,
    },
  },
  mounted() {
    let canvas = document.getElementById("mycanvas") as HTMLCanvasElement;
    puzzleController.createPuzzle(
      canvas,
      this.src,
      this.nx,
      this.ny,
      this.con_percentage
    );
  },
});
</script>