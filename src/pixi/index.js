import * as PIXI from "pixi.js";

let app;
let startContainer, introContainer, mainContainer;
let startBtn, nextBtn;

let label = 0;
let textE;
let predictHandler;

const setCenter = (son, parent) => {
  son.position.x = parent.width / 2;
  son.position.y = parent.height / 2;

  son.pivot.x = son.width / 2;
  son.pivot.y = son.height / 2;
};

const setRotate = (ele, angle) => {
  ele.rotation = (Math.PI * angle) / 180;
};

const newButton = (parent, text, clickHandler) => {
  let button = new PIXI.Graphics();
  button.beginFill(0xffffff);
  button.drawRoundedRect(0, 0, 200, 50, 5);
  button.endFill();
  button.interactive = true;
  button.buttonMode = true;
  button.on("click", (event) => {
    clickHandler && clickHandler(event);
  });
  setCenter(button, parent);

  let innerText = new PIXI.Text(text, {
    fontSize: 25,
    fill: 0xea1e63,
    align: "center",
  });
  button.addChild(innerText);
  setCenter(innerText, button);

  parent.addChild(button);
  return button;
};

const showMsgContainer = (msg) => {
  let mask = new PIXI.Graphics();
  mask.beginFill(0xffffff);
  mask.drawRoundedRect(0, 0, 200, 200, 10);
  mask.endFill();

  let errorContainer = new PIXI.Container();
  errorContainer.addChild(mask);

  let error = new PIXI.Text(msg, {
    fontSize: 30,
    fill: 0xff387d,
  });
  errorContainer.addChild(error);
  setCenter(error, errorContainer);

  app.stage.addChild(errorContainer);
  setCenter(errorContainer, app.screen);

  setTimeout(() => {
    app.stage.removeChild(errorContainer);
  }, 2000);
};

const showTimer = () => {};

// init the start container : welcomeText + startBtn + introBtn
const showStartContainer = () => {
  let mask = new PIXI.Graphics();
  mask.beginFill(0xff387d);
  mask.drawRect(0, 0, 640, 700);
  mask.endFill();

  startContainer = new PIXI.Container();
  startContainer.addChild(mask);

  // Logo
  let logo = new PIXI.Text("E", {
    fontSize: 80,
    fill: 0xffffff,
    stroke: "#4a1850",
    strokeThickness: 3,
  });
  mask.addChild(logo);
  setCenter(logo, mask);
  logo.y -= 100;

  let total = 0;
  app.ticker.add((delta) => {
    total += delta;
    setRotate(logo, total);
  });

  // welcome text at the beginning
  let welcomeText = new PIXI.Text("Welcome to ArVision !", {
    fontSize: 30,
    fontWeight: 600,
    fill: 0xffffff,
    align: "center",
    stroke: "#4a1850",
    strokeThickness: 5,
  });
  mask.addChild(welcomeText);
  setCenter(welcomeText, mask);
  console.log(welcomeText);

  // button to start the game
  startBtn = newButton(mask, "Start", (event) => {
    showMainContainer();
    app.stage.removeChild(startContainer);
  });
  startBtn.y += welcomeText.height + 50;

  // button to introduce the game to user
  let introBtn = newButton(mask, "Introduction", (event) => {
    showIntroContainer();
    app.stage.removeChild(startContainer);
  });
  introBtn.y = startBtn.y + startBtn.height + 20;

  app.stage.addChild(startContainer);
  setCenter(startContainer, app.screen);
};

const showIntroContainer = () => {
  introContainer = new PIXI.Container();

  // Create a graphics object to define our mask
  let mask = new PIXI.Graphics();
  mask.beginFill(0xffffff);
  mask.drawRoundedRect(0, 0, 500, 300, 10);
  mask.endFill();
  introContainer.addChild(mask);

  // title text
  let title = new PIXI.Text("Intro", {
    fontSize: 30,
    fill: 0xff387d,
    align: "left",
  });
  title.x = 20;
  title.y = 20;
  mask.addChild(title);

  // intro text for game
  let introText = new PIXI.Text(
    "The game is called AR Vision.\n \
      1. You can add examples represented for up & down & left & right at right by camera.\n \
      2. Click the start button to start the game: You should pose the corresponding examples added \
, for every character 'E'.",
    {
      fontSize: 20,
      fill: 0xff387d,
      wordWrap: true,
      wordWrapWidth: 500,
      align: "left",
    }
  );
  mask.addChild(introText);
  setCenter(introText, mask);

  // close button
  let clostBtn = newButton(mask, "Close", () => {
    showStartContainer();
    app.stage.removeChild(introContainer);
  });
  clostBtn.y += mask.height;

  app.stage.addChild(introContainer);
  setCenter(introContainer, app.screen);
};

const showMainContainer = () => {
  let mask = new PIXI.Graphics();
  mask.beginFill(0xff387d);
  mask.drawRect(0, 0, 640, 700);
  mask.endFill();

  mainContainer = new PIXI.Container();
  mainContainer.addChild(mask);

  let title = new PIXI.Text("Posing  for  'E'  in  3s !", {
    fill: 0xffffff,
    stroke: "#4a1850",
    strokeThickness: 5,
  });
  title.x = mask.width / 2 - 60;
  title.y = 20;
  mask.addChild(title);

  // main text: 'E'
  textE = new PIXI.Text("E", {
    fontSize: 80,
    fill: 0xffffff,
    align: "center",
  });

  mask.addChild(textE);
  setCenter(textE, mask);

  // button: return the start container
  let returnBtn = newButton(mask, "Return", () => {
    app.stage.removeChild(mainContainer);
    showStartContainer();
  });
  returnBtn.x = returnBtn.width / 2 + 10;
  returnBtn.y = returnBtn.height / 2 + 10;

  // counter text
  let counter = new PIXI.Text("0s", {
    fontSize: 30,
    fill: 0xffffff,
  });
  mask.addChild(counter);
  setCenter(counter, mask);
  counter.y = returnBtn.height + returnBtn.y + 10;

  // eyeSight
  let sight = new PIXI.Text("Your eyesight is xx", {
    fontSize: 30,
    fill: 0xffffff,
  });
  mask.addChild(sight);
  sight.x = 10;
  sight.y = mask.height - sight.height;

  predictHandler(counter, sight);

  // next E --- rotate E
  let nextBtn = newButton(mask, "Next", () => {
    label = Math.floor(Math.random() * 4);
    console.log(label);
    setRotate(textE, 90 * label);
    predictHandler(counter, sight);
  });
  nextBtn.y += textE.height + 50;

  app.stage.addChild(mainContainer);
};

export default {
  /**
   * init the canvas by pixi
   * @param {HtmlElement} pixi
   */
  init(pixi) {
    app = new PIXI.Application({
      width: 640,
      height: 750,
      backgroundColor: 0xea1e63,
      backgroundAlpha: 0.9,
    });
    pixi.appendChild(app.view);

    showStartContainer();
  },
  addStartHandler(clickHandler) {
    startBtn.on("click", (event) => {
      clickHandler && clickHandler(event);
    });
  },
  addPredictHandler(handler) {
    predictHandler = (counterText, sightText) => {
      // core step !!!
      let counter = 3;
      let timer = setInterval(() => {
        console.log("[ArVision] Checking...");
        counterText.text = counter + "s";
        if (counter <= 0) {
          clearInterval(timer);
          showMsgContainer("Overtime ! ???!");
          textE.style.fontSize = 80;
        }
        if (handler(label)) {
          clearInterval(timer);
          showMsgContainer("Nice Job ! ???!");
          let size = 4 + (80 - textE.style.fontSize) / 70;
          console.log(size, textE.style.fontSize);
          sightText.text = "Your eyesight is " + size;
          textE.style.fontSize -= 7;
        }
        counter -= 0.5;
      }, 500);
    };
  },
};
