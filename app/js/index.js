import Context, { selectField } from "./context.js";
import { setGridStyles, validateConfig } from "./helpers.js";
import { restartGame, startGame } from "./game.js";

const sizeSelect = document.getElementById("size-select");
const customSettings = document.getElementById("custom-settings");

const configs = {
  novice: {
    width: 9,
    height: 9,
    bombs: 10,
  },
  amateur: {
    width: 16,
    height: 16,
    bombs: 40,
  },
  professional: {
    width: 30,
    height: 16,
    bombs: 99,
  },
};

// default configuration
Context.setState({ ...configs.novice, flags: configs.novice.bombs, size: 24 });

startGame();

document.addEventListener("click", (event) => {
  const { target } = event;

  if (target.classList.contains("cell")) {
    handleCellClick(target);
  } else if (target.id === "restart") {
    restartGame();
  } else if (target.id === "custom") {
    customSettings.classList.toggle("_active");
  } else if (["novice", "amateur", "professional"].includes(target.id)) {
    customSettings.classList.remove("_active");
    Context.setState(validateConfig(configs[target.id]));
    restartGame();
  }
});

const handleCellClick = (target) => {
  const field = selectField();
  const x = +target.dataset.x;
  const y = +target.dataset.y;
  field[y][x].click(field);
};

document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  if (event.target.classList.contains("cell")) {
    const field = selectField();
    const x = +event.target.dataset.x;
    const y = +event.target.dataset.y;
    field[y][x].flag();
  }
});

customSettings.addEventListener("submit", (event) => {
  event.preventDefault();
  const widthFromSettings = +widthInput.value;
  const heightFromSettings = +heightInput.value;
  let bombsFromSettings = +bombsInput.value;

  let customSettingsObject = {
    width: widthFromSettings,
    height: heightFromSettings,
    bombs: bombsFromSettings,
  };

  //set config after validation
  Context.setState(validateConfig(customSettingsObject));
  const { width, height, bombs } = Context.getState();
  widthInput.value = width;
  heightInput.value = height;
  bombsInput.value = bombs;
  restartGame();
});

sizeSelect.addEventListener("change", (event) => {
  Context.setState({ size: +event.target.value });
  setGridStyles();
});
