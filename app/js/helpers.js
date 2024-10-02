import Context from "./context.js";

const flagsCount = document.getElementById("flags-count");

export const setGridStyles = () => {
  const { width, height, size } = Context.getState();
  document.documentElement.style.setProperty("--cell-size", `${size / 16}rem`);
  document.documentElement.style.setProperty("--field-width", width);
  document.documentElement.style.setProperty("--field-height", height);
};

export const updateFlagsCount = () => {
  let { flags } = Context.getState();
  flags = flags > 999 ? 999 : flags < -99 ? -99 : flags;
  const flagsNumbers = flags.toString().padStart(3, "0").split("");

  for (let i = 0; i < flagsNumbers.length; i++) {
    let currentElement = flagsCount.children[i];
    let classes = ["counter__element", `type-num${flagsNumbers[i]}`];
    if (!currentElement.classList.contains(`type-num${flagsNumbers[i]}`)) {
      currentElement.classList.value = classes.join(" ");
    }
  }
};

export const incrementFlagsCount = () => {
  const { flags } = Context.getState();
  Context.setState({ flags: flags + 1 });
  updateFlagsCount();
};

export const decrementFlagsCount = () => {
  const { flags } = Context.getState();
  Context.setState({ flags: flags - 1 });
  updateFlagsCount();
};

/**
 *
 * @param {Object} config
 * @returns {Object}
 */
export const validateConfig = (config) => {
  let { width, height, bombs } = config;
  const maxWidth = 100,
    maxHeight = 100;
  width = width > maxWidth ? maxWidth : width;
  height = height > maxHeight ? maxHeight : height;
  if (width < 9) width = 9;
  if (height < 9) height = 9;
  const maxBombs = Math.floor((width * height) / 4);
  const minBombs = Math.floor((width * height) / 15);

  const safeConfiguration = {
    width,
    height,
    bombs: bombs > maxBombs ? maxBombs : bombs < minBombs ? minBombs : bombs,
  };

  return safeConfiguration;
};

/**
 * @param {Array} field
 * @param {Function} callback
 * @returns {void}
 */
export const eachCell = (field, callback) => {
  field.forEach((row) => {
    row.forEach((cell) => {
      callback(cell);
    });
  });
};
