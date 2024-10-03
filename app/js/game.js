import Cell from "./cell.js";
import Context, { selectField } from "./context.js";
import { eachCell, setStyles, updateFlagsCount } from "./helpers.js";
import Timer from "./timer.js";

const restartButton = document.getElementById("restart");

/**
 * @param {Object} cell
 * @param {Array} field
 * @returns {number}
 */
export const checkBombsAround = (cell) => {
  const field = selectField();
  return cell.cellsAround(field).filter((cell) => cell.bomb).length;
};

/**
 * @param {Object} cell
 * @param {Array} field
 * @returns {void}
 */
export const openNeighborCells = (cell, field) => {
  let toOpen = [cell];
  while (toOpen.length > 0) {
    const current = toOpen.pop();
    const bombsAround = checkBombsAround(current, field);

    if (bombsAround === 0) {
      current.cellsAround(field).forEach((neighbor) => {
        if (!neighbor.open && !neighbor.flagged && !neighbor.bomb) {
          neighbor.open = true;
          toOpen.push(neighbor);
        }
      });
    }
    current.draw(field);
  }
};

/**
 * @param {Array} field
 * @param {Object} settings
 * @returns {Array}
 */
export const generateBombs = (field, { width, height, bombs }) => {
  let bombsPlaced = 0;
  while (bombsPlaced < bombs) {
    let x = Math.floor(Math.random() * width);
    let y = Math.floor(Math.random() * height);

    if (!field[y][x].bomb) {
      field[y][x].bomb = true;
      bombsPlaced++;
    }
  }
  return field;
};

/**
 * @param {Array} field
 * @returns {void}
 */
export const gameOver = (field) => {
  const classes = ["restart-button", "lose"];
  restartButton.classList.value = classes.join(" ");
  Timer.stop();
  eachCell(field, (cell) => {
    if (!cell.open) {
      cell.open = true;
      cell.draw(field);
    }
  });
};

export const checkGameWin = (field) => {
  let openCells = field.flat().filter((cell) => cell.open).length;
  let width = field[0].length;
  let height = field.length;
  let bombs = field.flat().filter((cell) => cell.bomb).length;
  if (openCells === width * height - bombs) {
    const classes = ["restart-button", "win"];
    restartButton.classList.value = classes.join(" ");
    console.log(Timer);
    Timer.stop();
    eachCell(field, (cell) => {
      if (!cell.open) {
        cell.open = true;
        cell.draw(field);
      }
    });
  }
};

const createField = () => {
  let field = [];
  const { width, height, bombs } = Context.getState();
  for (let y = 0; y < height; y++) {
    let row = [];
    for (let x = 0; x < width; x++) {
      row.push(new Cell(x, y));
    }
    field.push(row);
  }
  return generateBombs(field, { width, height, bombs });
};

const renderField = () => {
  root.innerHTML = "";
  const fragment = document.createDocumentFragment();
  const field = selectField();

  eachCell(field, (cell) => {
    const { size } = Context.getState();
    let cellElement = document.createElement("div");
    cellElement.classList.add("cell", "closed", `size-${size}`);
    cellElement.dataset.x = cell.x;
    cellElement.dataset.y = cell.y;
    fragment.appendChild(cellElement);
  });

  root.appendChild(fragment);
};

export const restartGame = () => {
  root.innerHTML = "";
  const classes = ["restart-button"];
  restartButton.classList.value = classes.join(" ");
  Timer.reset();
  startGame();
};

export const startGame = () => {
  Context.setState({ field: createField(), flags: Context.getState().bombs });
  renderField();
  updateFlagsCount();
  setStyles();
};
