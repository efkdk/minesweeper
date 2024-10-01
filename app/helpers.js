import Context from "./context.js";

const flagsCount = document.getElementById("flags-count");
const root = document.getElementById("root");

export const setGridStyles = () => {
  const { width, height, size } = Context.getState();
  root.style.gridTemplateColumns = `repeat(${width}, ${size / 16}rem)`;
  root.style.gridTemplateRows = `repeat(${height}, ${size / 16}rem)`;
  root.style.gap = `${size / 7}px`;
};

export const updateFlagsCount = () => {
  const { flags } = Context.getState();
  flagsCount.textContent = flags;
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
