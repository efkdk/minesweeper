import Context, { selectField } from "./context.js";
import { setStyles, validateConfig } from "./helpers.js";
import { prepareGame, safeStart, restartGame, startGame } from "./game.js";

const sizeSelect = document.getElementById("size-select");
const customSettings = document.getElementById("custom-settings");
const switcher = document.getElementById("switcher");

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

const handleCellClick = (target, type) => {
  const field = selectField();
  const x = +target.dataset.x;
  const y = +target.dataset.y;
  switch (type) {
    case "click":
      field[y][x].click(field);
      break;
    case "flag":
      field[y][x].flag();
      break;
    case "startSpying":
      Context.setState({ spy: field[y][x] });
      field[y][x].startSpying(field);
      break;
    case "stopSpying":
      field[y][x].stopSpying(field);
      break;
    default:
      field[y][x].click(field);
  }
};

document.addEventListener("click", (event) => {
  const { target } = event;
  let { clicks } = Context.getState();
  const { isFirstSafeClick } = Context.getState();

  if (target.classList.contains("cell")) {
    if (clicks === 0 && isFirstSafeClick) {
      const x = +target.dataset.x;
      const y = +target.dataset.y;
      safeStart({ x, y });
    }
    Context.setState({ clicks: ++clicks });
    handleCellClick(target, "click");
  } else if (target.id === "restart") {
    restartGame();
  } else if (target.id === "custom") {
    customSettings.classList.toggle("_active");
  } else if (["novice", "amateur", "professional"].includes(target.id)) {
    customSettings.classList.remove("_active");
    Context.setState({
      ...configs[target.id],
      flags: configs[target.id].bombs,
    });
    restartGame();
  } else if (target.id === "theme-toggler") {
    const { theme } = Context.getState();
    Context.setState({ theme: theme === "light" ? "dark" : "light" });
    setStyles();
  } else if (target.id === "switcher") {
    Context.setState({ isFirstSafeClick: switcher.checked });
    restartGame();
  }
});

document.addEventListener("contextmenu", (event) => {
  const { target } = event;
  event.preventDefault();
  if (target.classList.contains("cell")) {
    let { clicks } = Context.getState();
    Context.setState({ clicks: ++clicks });
    handleCellClick(target, "flag");
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
  const safeConfig = validateConfig(customSettingsObject);
  Context.setState({ ...safeConfig, flags: safeConfig.bombs });
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

document.addEventListener("mousedown", (event) => {
  const { target } = event;
  const { clicks } = Context.getState();
  if (target.classList.contains("cell") && event.button === 0 && clicks !== 0) {
    handleCellClick(target, "startSpying");
  }
});

document.addEventListener("mouseup", (event) => {
  if (event.button !== 0) return;
  const { spy } = Context.getState();
  const field = selectField();
  if (spy) {
    spy.stopSpying(field);
    Context.setState({ spy: null });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  let settings = localStorage.getItem("settings");
  if (typeof settings === "string") {
    settings = JSON.parse(settings);
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
      isFirstSafeClick: true,
      flags: configs.novice.bombs,
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

  const { isFirstSafeClick } = Context.getState();
  if (!isFirstSafeClick) {
    switcher.checked = false;
    startGame();
  } else {
    switcher.checked = true;
    prepareGame();
  }
});

window.addEventListener("beforeunload", () => {
  const { theme, width, height, bombs, size, configName, isFirstSafeClick } =
    Context.getState();
  localStorage.setItem(
    "settings",
    JSON.stringify({
      theme,
      width,
      height,
      bombs,
      flags: bombs,
      size,
      configName,
      isFirstSafeClick: isFirstSafeClick,
    })
  );
});
