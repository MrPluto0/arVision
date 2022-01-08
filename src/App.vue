<script setup>
import { ref, reactive, onMounted } from "vue";
import tf from "@/tensorflow";
import pixi from "@/pixi";

const webcam = ref(null)
const noWebcam = ref(null)
const pixiDom = ref(null)
const labelsRef = ref([])

const labels = reactive(["up", "down", "left", "right"])

const addRef = (el) => {
  labelsRef.value.push(el);
}

onMounted(() => {
  tf.init(webcam.value, noWebcam.value);

  pixi.init(pixiDom.value);
  pixi.addStartHanlder(() => {
    console.log("[ArVision] Start Gaming...");
  })
})

// methods
const train = () => {
  console.log("[ArVision] Training...");
  tf.train();
}

const predict = () => {
  console.log("[ArVision] Predict...");
  tf.predict();
}

// add webcam image
const handler = (label) => {
  console.log("[ArVision] Add Example %s...", label);
  tf.handler(label, labelsRef.value[label]);
}

</script>

<template>
  <div ref="no-webcam" class="no-webcam">
    No webcam found.
    <br />To use this demo, use a device with a webcam.
  </div>
  <div class="main">
    <div class="pixiDom" ref="pixiDom"></div>
    <div class="webcam-outer">
      <h3>Camera For you !</h3>
      <div class="webcam-wrapper">
        <video autoplay playsinline muted class="webcam" ref="webcam" width="224" height="224"></video>
      </div>
      <button @click="train" class="train-btn">Train</button>
      <button @click="predict" class="predict-btn">Predict</button>
    </div>
    <div class="thumbs-outer">
      <h3>Examples for game</h3>
      <div class="thumbs-wrapper">
        <div class="thumb" v-for="(item,index) in labels" :key="index">
          <div class="item">
            <canvas class="thumb-canvas" width="224" height="224" :ref="addRef"></canvas>
          </div>
          <button class="thumb-btn" @click="handler(index)">Add Example for {{ item }}</button>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped lang="less">
.main {
  display: flex;
}
.webcam-outer {
  margin: 0 50px 10px;
  .webcam-wrapper {
    .webcam {
      border-radius: 10px;
      transform: scaleX(-1);
    }
  }
  button {
    display: block;
    width: 100%;
    margin-top: 5px;
    outline: none;
    padding: 5px 10px;
    border-radius: 5px;
    border: none;
  }
  .train-btn {
    background-color: #409eff;
    color: white;
  }
}
.no-webcam {
  display: none;
}
.thumbs-wrapper {
  height: 480px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  .thumb {
    margin: 10px;
    .item {
      padding: 10px;
      border-radius: 10px;
      border: 2px solid silver;
    }
    .thumb-canvas {
      height: 150px;
      width: 150px;
      transform: scaleX(-1);
    }
    button {
      margin-top: 5px;
      outline: none;
      padding: 5px 10px;
      border-radius: 5px;
      border: none;
      background-color: #67c23a;
      color: white;
      width: 100%;
      &:hover {
        border-color: skyblue;
      }
      &:active {
        transform: scale(0.98);
      }
    }
  }
}
</style>
