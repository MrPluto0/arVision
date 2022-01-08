<script setup>
import { ref, reactive, onMounted } from "vue";
import tf from "@/tensorflow";
import pixi from "@/pixi";

const nowLabel = ref(-1);
const webcam = ref(null);
const noWebcam = ref(null);
const pixiDom = ref(null);
const labelsRef = ref([]);

const labels = reactive(["right", "down", "left", "up",])

const addRef = (el) => {
  labelsRef.value.push(el);
}

onMounted(() => {
  tf.init(webcam.value, noWebcam.value);
  pixi.init(pixiDom.value);
  pixi.addStartHandler(() => {
    console.log("[ArVision] Start Gaming...");
  })
  pixi.addPredictHandler((targetLabel) => {
    console.log("[ArVision] now: %d, target: %d", nowLabel.value, targetLabel);
    return targetLabel === nowLabel.value
  })
})

// methods
const train = () => {
  console.log("[ArVision] Training...");
  tf.train();
}

const predict = () => {
  console.log("[ArVision] Predict...");
  tf.predict((label) => {
    nowLabel.value = label;
  });
}

const stop = () => {
  console.log("[ArVision] Stop Predict...");
  tf.stopPredict();
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
      <button @click="stop" class="stop-btn">Stop</button>
    </div>
    <div class="thumbs-outer">
      <h3>Pose Examples for game</h3>
      <div class="thumbs-wrapper">
        <div class="thumb" v-for="(item,index) in labels" :key="index">
          <div class="item" :class="nowLabel == index ? 'active' : ''">
            <canvas class="thumb-canvas" width="224" height="224" :ref="addRef"></canvas>
          </div>
          <button class="thumb-btn" @click="handler(index)">Add example for {{ item }}</button>
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
    padding: 7px 10px;
    border-radius: 5px;
    border: none;
    color: white;
    &:active {
      transform: scale(0.98);
    }
  }
  .train-btn {
    background-color: #67c23a;
  }
  .predict-btn {
    background-color: #409eff;
  }
  .stop-btn {
    background-color: #f56c6c;
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
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.6);
      &.active {
        box-shadow: 0 0 10px rgba(23, 189, 255, 0.9);
      }
    }
    .thumb-canvas {
      height: 150px;
      width: 150px;
      transform: scaleX(-1);
    }
    button {
      margin: 10px 0;
      outline: none;
      padding: 7px 10px;
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
