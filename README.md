# Vue 3 + Vite

采用 Vue3 + Vite 搭建项目

## 架构

游戏这部分占据屏幕左侧，照相和添加 example 的部分放到右侧，右侧再具体细分。多使用 flex 布局，较具有弹性。如比如页面右下角那四个 example 就是 flex+vue 的 v-for 数组生成的。

## 加载动画

采用绝对布局，放到页面中间的，绘制一个圆形带蓝色边的圆形，借助 keyframe 的 rotate 来使其旋转。

# TensorFlow

借助 Google 的算法模型，来完成图像识别。

[webcam-transfer-learning](https://github.com/tensorflow/tfjs-examples)

1. 找到 webcam-transfer-learning 样例，解剖 train，predict 和 addExample 这三个核心部分。
2. 文件`controller_dataset.js`，就是一个数据集处理对象，其中的函数 addExample 就是用来获取 webcam 的摄像截图的，针对这些数据 train 才能够训练，训练结束后才可以进行预测
3. `ui.js`就是相关的 dom 处理文件。
4. 各个文件在使用时需要修改参数，比如其中的学习率，每次 fit 后的缺损值等。同时传入 dom 元素，video 元素等。
5. 通过回调函数来与`pixi`和`App.vue`来同步数据。

# PiXi

借助 2d canvas 框架 PIXI 完成对小游戏的绘制。

## 选择

考虑的好几个 canvas 框架，pixi 这个能够很方面就直接嵌套到 vue 里，且有文档（虽然是英文的）。其使用类似于`QT`等客户端的生成方式，通过通过复杂的添加组件，及样式方式来生成。

## 游戏页面布局

分成三个界面 main，start，intro，用三个函数分别绘制三个界面：开始界面，介绍界面和主界面，以便能够在隐藏界面后再次调用一下函数就可生成界面。然后对其它一些东西也做一定封装，比如那个界面上的白底红字按钮，居中的设置，旋转等。

## 游戏逻辑

在主界面的中间放一个字母 E，用户每次有 3s 响应时间，响应失败则会重新开始，动作正确后，可以点击 next 继续下一个，每次成功会缩小字母 E 的 fontSize，从而起到正常测视力的效果，视力的值与字母 E 的 fontSize 可以说在 4.0 的基础上成正比。

同时，每次进行过程中，倒计时会进行，每次时间流逝，那个倒计时的 text 会重新渲染。那个 fontSize 也一样，在单词成功或失败后会更新。

## 旋转的 E

中间的旋转的 E。

来源于最初的一个想法，是想在 main 界面放旋转的 E，每次点击 next，E 会减速旋转，然后达到一个方向，不过这样实现起来些许复杂，最后就产生中间那个旋转的 E 了。

这是通过 `pixi` 的 `ticker` 来做到的，其底层可能借助 `requestAnimationFrame` 来按帧执行函数的，每帧转动一定角度。
