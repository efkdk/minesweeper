import Context, { selectField } from "./context.js";
import { setStyles, validateConfig } from "./helpers.js";
import { restartGame, startGame } from "./game.js";

const sizeSelect = document.getElementById("size-select");
const customSettings = document.getElementById("custom-settings");

const configs = {
  novice: {
    width: 9,
    height: 9,
    bombs: 10,
    configName: "novice",
  },
  amateur: {
    width: 16,
    height: 16,
    bombs: 40,
    configName: "amateur",
  },
  professional: {
    width: 30,
    height: 16,
    bombs: 99,
    configName: "professional",
  },
};

const handleCellClick = (target) => {
  const field = selectField();
  const x = +target.dataset.x;
  const y = +target.dataset.y;
  field[y][x].click(field);
};

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
    Context.setState(configs[target.id]);
    restartGame();
  } else if (target.id === "theme-toggler") {
    const { theme } = Context.getState();
    Context.setState({ theme: theme === "light" ? "dark" : "light" });
    setStyles();
  }
});

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
    configName: "custom",
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
  setStyles();
});

document.addEventListener("DOMContentLoaded", () => {
  let settings = localStorage.getItem("settings");
  if (typeof settings === "string") {
    settings = JSON.parse(settings);
    console.log(settings);
    Context.setState(settings);
  } else {
    const isPrefersDarkTheme = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );
    // default configuration
    Context.setState({
      theme: isPrefersDarkTheme.matches ? "dark" : "light",
      ...configs.novice,
      size: 24,
    });
  }

  const { configName } = Context.getState();
  if (configName === "custom") {
    const { width, height, bombs } = Context.getState();
    customSettings.classList.add("_active");
    widthInput.value = width;
    heightInput.value = height;
    bombsInput.value = bombs;
  }

  sizeSelect.value = Context.getState().size;
  startGame();
});

window.addEventListener("beforeunload", () => {
  const { theme, width, height, bombs, size, configName } = Context.getState();
  localStorage.setItem(
    "settings",
    JSON.stringify({
      theme,
      width,
      height,
      bombs,
      size,
      configName,
    })
  );
});
