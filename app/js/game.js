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
const checkBombsAround = (cell) => {
  const field = selectField();
  return cell.cellsAround(field).filter((cell) => cell.bomb).length;
};

/**
 * @param {Object} cell
 * @param {Array} field
 * @returns {void}
 */
const openNeighborCells = (cell, field) => {
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
const generateBombs = (field, { width, height, bombs }) => {
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
 * @param {string} type
 * @returns {void}
 */
const handleGameEnd = (field, type) => {
  showStats(type);
  Timer.stop();
  eachCell(field, (cell) => {
    if (!cell.open) {
      cell.open = true;
      cell.draw(field);
    }
  });
};

/**
 * @param {Array} field
 * @returns {void}
 */
const gameOver = (field) => {
  const classes = ["restart-button", "lose"];
  restartButton.classList.value = classes.join(" ");
  handleGameEnd(field, "lose");
};

const checkGameWin = (field) => {
  let openCells = field.flat().filter((cell) => cell.open).length;
  let width = field[0].length;
  let height = field.length;
  let bombs = field.flat().filter((cell) => cell.bomb).length;
  if (openCells === width * height - bombs) {
    const classes = ["restart-button", "win"];
    restartButton.classList.value = classes.join(" ");
    handleGameEnd(field, "win");
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

const restartGame = () => {
  root.innerHTML = "";
  const classes = ["restart-button"];
  restartButton.classList.value = classes.join(" ");
  Timer.reset();
  closeStats();
  startGame();
};

const startGame = () => {
  Context.setState({ field: createField(), flags: Context.getState().bombs });
  renderField();
  updateFlagsCount();
  setStyles();
};

const showStats = (gameStatus) => {
  const modal = document.querySelector(".modal");
  const clicksOutput = document.getElementById("stats-clicks");
  const timerOutput = document.getElementById("stats-time");
  const gameStatusOutput = document.getElementById("stats-gameStatus");
  const { hours, minutes, seconds } = Timer.getTime();
  const { clicks } = Context.getState();
  gameStatusOutput.textContent =
    gameStatus === "win" ? "You win :)" : "You lose :(";
  timerOutput.textContent = `${
    hours !== 0 ? `${hours !== 1 ? `${hours} hours` : "1 hour"}` : ""
  } ${
    minutes !== 0 ? `${minutes !== 1 ? `${minutes} minutes` : "1 minute"}` : ""
  } ${seconds !== 1 ? `${seconds} seconds` : "1 second"} (${Timer.seconds}s)`;
  clicksOutput.textContent = clicks;
  modal.classList.add("_active");
};

const closeStats = () => {
  const modal = document.querySelector(".modal");
  modal.classList.remove("_active");
  Context.setState({ clicks: 0 });
};

export {
  checkBombsAround,
  openNeighborCells,
  generateBombs,
  gameOver,
  checkGameWin,
  restartGame,
  startGame,
};
