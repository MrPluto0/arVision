import * as tf from "@tensorflow/tfjs";
import * as tfd from "@tensorflow/tfjs-data";

import { ControllerDataset } from "./controller_dataset";

// predicting 4 classes for up, down, left, and right.
const NUM_CLASSES = 4;
const CONTROLS = ["up", "down", "left", "right"];
const CONTROL_CODES = [38, 40, 37, 39];

const controllerDataset = new ControllerDataset(NUM_CLASSES);

let webcam;
let model;
let truncatedMobileNet;
let isPredicting = false;

// Loads mobilenet and returns a model that returns the internal activation
// we'll use as input to our classifier model.
async function loadTruncatedMobileNet() {
  const mobilenet = await tf.loadLayersModel(
    "https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json"
  );

  // Return a model that outputs an internal activation.
  const layer = mobilenet.getLayer("conv_pw_13_relu");
  return tf.model({ inputs: mobilenet.inputs, outputs: layer.output });
}

/**
 * Captures a frame from the webcam and normalizes it between -1 and 1.
 * Returns a batched image (1-element batch) of shape [1, w, h, c].
 */
async function getImage() {
  const img = await webcam.capture();
  const processedImg = tf.tidy(() =>
    img.expandDims(0).toFloat().div(127).sub(1)
  );
  img.dispose();
  return processedImg;
}

export default {
  async init(webcamDom, noWebcamDom) {
    try {
      webcam = await tfd.webcam(webcamDom);
    } catch (e) {
      console.log("[Error]", e);
      noWebcamDom.style.display = "block";
    }
    truncatedMobileNet = await loadTruncatedMobileNet();

    // Warm up the model. This uploads weights to the GPU and compiles the WebGL
    // programs so the first time we collect data from the webcam it will be
    // quick.
    const screenShot = await webcam.capture();
    truncatedMobileNet.predict(screenShot.expandDims(0));
    screenShot.dispose();
  },

  /**
   * Sets up and trains the classifier.
   */
  async train() {
    isPredicting = false;
    if (controllerDataset.xs == null) {
      throw new Error("Add some examples before training!");
    }

    // Creates a 2-layer fully connected model. By creating a separate model,
    // rather than adding layers to the mobilenet model, we "freeze" the weights
    // of the mobilenet model, and only train weights from the new model.
    model = tf.sequential({
      layers: [
        // Flattens the input to a vector so we can use it in a dense layer. While
        // technically a layer, this only performs a reshape (and has no training
        // parameters).
        tf.layers.flatten({
          inputShape: truncatedMobileNet.outputs[0].shape.slice(1),
        }),
        // Layer 1.
        tf.layers.dense({
          units: 100,
          activation: "relu",
          kernelInitializer: "varianceScaling",
          useBias: true,
        }),
        // Layer 2. The number of units of the last layer should correspond
        // to the number of classes we want to predict.
        tf.layers.dense({
          units: NUM_CLASSES,
          kernelInitializer: "varianceScaling",
          useBias: false,
          activation: "softmax",
        }),
      ],
    });

    // learning rate = 0.0001
    const optimizer = tf.train.adam(0.0001);

    // We use categoricalCrossentropy which is the loss function we use for
    // categorical classification which measures the error between our predicted
    // probability distribution over classes (probability that an input is of each
    // class), versus the label (100% probability in the true class)>
    model.compile({ optimizer: optimizer, loss: "categoricalCrossentropy" });

    // We parameterize batch size as a fraction of the entire dataset because the
    // number of examples that are collected depends on how many examples the user
    // collects. This allows us to have a flexible batch size.
    const batchSize = Math.floor(controllerDataset.xs.shape[0] * 0.4);
    if (!(batchSize > 0)) {
      throw new Error(
        `Batch size is 0 or NaN. Please choose a non-zero fraction.`
      );
    }

    // Train the model! Model.fit() will shuffle xs & ys so we don't have to.
    model.fit(controllerDataset.xs, controllerDataset.ys, {
      batchSize,
      epochs: 20,
      callbacks: {
        onBatchEnd: async (batch, logs) => {
          console.log("Loss: " + logs.loss.toFixed(5));
        },
      },
    });
  },

  async predict() {
    isPredicting = true;
    while (isPredicting) {
      // Capture the frame from the webcam.
      const img = await getImage();

      // Make a prediction through mobilenet, getting the internal activation of
      // the mobilenet model, i.e., "embeddings" of the input images.
      const embeddings = truncatedMobileNet.predict(img);

      // Make a prediction through our newly-trained model using the embeddings
      // from mobilenet as input.
      const predictions = model.predict(embeddings);

      // Returns the index with the maximum probability. This number corresponds
      // to the class the model thinks is the most probable given the input.
      const predictedClass = predictions.as1D().argMax();
      const classId = (await predictedClass.data())[0];
      console.log(classId);

      img.dispose();

      // ui.predictClass(classId);
      await tf.nextFrame();
    }
    // ui.donePredicting();
  },

  async handler(label, canvas) {
    let img = await getImage();

    // Add sample to DataSet for Training and Predict
    controllerDataset.addExample(truncatedMobileNet.predict(img), label);

    // Draw the preview thumbnail.
    const [width, height] = [224, 224];
    const ctx = canvas.getContext("2d");
    const imageData = new ImageData(width, height);
    const data = img.dataSync();
    for (let i = 0; i < height * width; ++i) {
      const j = i * 4;
      imageData.data[j + 0] = (data[i * 3 + 0] + 1) * 127;
      imageData.data[j + 1] = (data[i * 3 + 1] + 1) * 127;
      imageData.data[j + 2] = (data[i * 3 + 2] + 1) * 127;
      imageData.data[j + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    img.dispose();
  },

  stopPredict() {
    isPredicting = false;
  },
};
