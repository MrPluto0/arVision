<script setup>
import { ref, reactive, onMounted } from "vue";
import tf from "@/tensorflow";
import pixi from "@/pixi";

const loadDisplay = ref("block");
const mainDisplay = ref("none");

const loss = ref(0);
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
  tf.init(webcam.value, noWebcam.value, () => {
    loadDisplay.value = "none";
    mainDisplay.value = "flex";
  });
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
  tf.train((logs) => {
    loss.value = logs.loss.toFixed(5);
  });
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

  <section class="loading">
    Loading MobileNet...
    <span class="loading__tip">AR Vision —— A Simple Game by AR.</span>
    <span class="loading__anim"></span>
  </section>

  <div class="main">
    <div class="pixiDom" ref="pixiDom"></div>
    <div class="webcam-outer">
      <div class="webcam-inner">
        <div class="webcam-wrapper">
          <video autoplay playsinline muted class="webcam" ref="webcam" width="224" height="224"></video>
        </div>
        <div class="webcam-sider">
          <div class="intro">
            <h3>Camera: Capture your photos!</h3>
            <ol>
              <li>1. Add examples for 4 directions.</li>
              <li>2. Training for loss:{{ loss }} stable and predict</li>
              <li>3. Start the game.</li>
            </ol>
          </div>
          <button @click="train" class="train-btn">Train</button>
          <button @click="predict" class="predict-btn">Predict</button>
          <button @click="stop" class="stop-btn">Stop</button>
        </div>
      </div>
      <div class="thumbs-outer">
        <h3 class="title">Pose Examples for game</h3>
        <div class="thumbs-wrapper">
          <div class="thumb" v-for="(item,index) in labels" :key="index">
            <div class="item" :class="nowLabel == index ? 'active' : ''">
              <canvas class="thumb-canvas" width="224" height="224" :ref="addRef"></canvas>
              <div class="tag">For {{ item }}</div>
            </div>
            <button class="thumb-btn" @click="handler(index)">Add example</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped lang="less">
ol,
li {
  list-style: none;
}
.loading {
  display: v-bind(loadDisplay);
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  margin: auto;
  line-height: 1.4;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
  .loading__tip {
    font-weight: normal;
    font-size: 0.9rem;
    color: rgba(189, 189, 189, 1);
    margin: 0.6rem 0 2rem 0;
    display: block;
  }

  .loading__anim {
    width: 35px;
    height: 35px;
    display: inline-block;
    border: 5px solid rgba(189, 189, 189, 0.25);
    border-left-color: rgba(3, 155, 229, 1);
    border-top-color: rgba(3, 155, 229, 1);
    border-radius: 50%;
    animation: rotate 600ms infinite linear;
  }
}

@keyframes rotate {
  to {
    transform: rotate(1turn);
  }
}
.main {
  display: v-bind(mainDisplay);
}
.webcam-outer {
  margin: 20px 20px;
  .webcam-inner {
    display: flex;
    .webcam-sider {
      margin-left: 30px;
      width: 90%;
      padding: 5px 10px;
      background-color: rgba(0, 0, 0, 0.1);
      border-radius: 10px;
      button {
        width: 200px;
      }
    }
  }
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
.thumbs-outer {
  margin-top: 20px;
  padding: 10px 10px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  .title {
    text-align: center;
    margin-bottom: 10px;
  }
}
.thumbs-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  .thumb {
    margin: 10px;
    .item {
      padding: 10px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.6);
      background-color: #fff;
      &.active {
        box-shadow: 0 0 10px rgba(23, 189, 255, 0.9);
      }
      .tag {
        color: #f56c6c;
        font-weight: bold;
        text-align: center;
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
