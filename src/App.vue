<script setup>
import { ref, reactive, onMounted } from "vue";
import tf from "@/tensorflow";

const webcam = ref(null)
const noWebcam = ref(null)
const labelsRef = ref([])

const labels = reactive(["up", "down", "left", "right"])

const addRef = (el) => {
  labelsRef.value.push(el);
}

onMounted(() => {
  tf.init(webcam.value, noWebcam.value)
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

const handler = (label) => {
  console.log("[ArVision] Add Example %s...", label);
  tf.handler(label, labelsRef.value[label]);
}

</script>

<template>
  <h2>Welcome to ArVision !</h2>
  <div ref="no-webcam" class="no-webcam">
    No webcam found.
    <br />To use this demo, use a device with a webcam.
  </div>
  <div class="webcam-wrapper">
    <video autoplay playsinline muted class="webcam" ref="webcam" width="224" height="224"></video>
  </div>
  <button @click="train">训练</button>
  <button @click="predict">预测</button>
  <div class="thumbs-wrapper">
    <div class="thumb" v-for="(item,index) in labels" :key="index">
      <div :class="item">
        <canvas class="thumb-canvas" width="224" height="224" :ref="addRef"></canvas>
      </div>
      <button class="thumb-btn" @click="handler(index)">添加</button>
    </div>
  </div>
</template>

``
<style scoped lang="less">
.webcam-wrapper {
  .webcam {
    border: 2px solid silver;
    border-radius: 10px;
    transform: scaleX(-1);
  }
}
.no-webcam {
  display: none;
}
.thumbs-wrapper {
  display: flex;
  .thumb {
    border: 2px solid silver;
    border-radius: 10px;
  }
  .thumb-canvas {
    transform: scaleX(-1);
  }
}
</style>
