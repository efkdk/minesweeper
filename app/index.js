const root = document.getElementById("root");
const gameStatus = document.getElementById("game-status");
const restartButton = document.getElementById("restart");
const flagsCount = document.getElementById("flags-count");
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
let { width, height, bombs } = configs.novice;
let flags = bombs;
let size = 24;

const updateFlagsCount = () => {
  flagsCount.textContent = flags;
};

const setGridStyles = () => {
  root.style.gridTemplateColumns = `repeat(${width}, ${size / 16}rem)`;
  root.style.gridTemplateRows = `repeat(${height}, ${size / 16}rem)`;
  root.style.gap = `${size / 7}px`;
};

const validateCustomSettings = (width, height, bombs) => {
  const maxWidth = 100,
    maxHeight = 100;
  width = width > maxWidth ? maxWidth : width;
  height = height > maxHeight ? maxHeight : height;
  const maxBombs = Math.floor((width * height) / 4);
  const minBombs = Math.floor((width * height) / 15);

  const safeConfiguration = {
    width,
    height,
    bombs: bombs > maxBombs ? maxBombs : bombs < minBombs ? minBombs : bombs,
  };
  return safeConfiguration;
};

const checkBombsAround = (cell) => {
  return cell.cellsAround(field).filter((cell) => cell.bomb).length;
};

updateFlagsCount();
setGridStyles();

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.bomb = false;
    this.flagged = false;
    this.open = false;
  }

  draw() {
    const cellElement = document.querySelector(
      `[data-x="${this.x}"][data-y="${this.y}"]`
    );
    const bombsAround = checkBombsAround(this);
    cellElement.className = `cell size-${size}`;
    if (this.flagged) {
      cellElement.classList.add("flagged");
    } else if (!this.open) {
      cellElement.classList.add("closed");
    } else {
      cellElement.classList.add("opened");
      if (this.bomb) {
        cellElement.classList.add("type10");
      } else {
        cellElement.classList.add(`type${bombsAround}`);
      }
    }
  }

  cellsAround(field) {
    let cells = [];
    for (let y = this.y - 1; y <= this.y + 1; y++) {
      for (let x = this.x - 1; x <= this.x + 1; x++) {
        if (x === this.x && y === this.y) continue;
        if (x >= 0 && x < width && y >= 0 && y < height) {
          cells.push(field[y][x]);
        }
      }
    }
    return cells;
  }

  click(field) {
    if ((this.open && checkBombsAround(this, field) === 0) || this.flagged)
      return;
    this.open = true;

    if (this.open && checkBombsAround(this, field) > 0) {
      let flagsAround = this.cellsAround(field).filter(
        (cell) => cell.flagged
      ).length;
      if (flagsAround === checkBombsAround(this, field)) {
        this.cellsAround(field)
          .filter((cell) => !cell.open && !cell.flagged)
          .forEach((neighbor) => {
            neighbor.click(field);
          });
      }
    }

    if (!this.bomb) {
      let toOpen = [this];
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
    } else {
      this.draw(field);
      gameOver();
    }
    checkGameWin();
  }

  flag() {
    if (this.open) return;

    this.flagged = !this.flagged;
    this.flagged ? flags-- : flags++;
    updateFlagsCount();
    this.draw();
  }
}

const eachCell = (callback) => {
  field.forEach((row) => {
    row.forEach((cell) => {
      callback(cell);
    });
  });
};

const generateBombs = (field, bombs) => {
  let positions = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      positions.push([x, y]);
    }
  }

  for (let i = 0; i < bombs; i++) {
    let j = Math.floor(Math.random() * (positions.length - i)) + i;
    [positions[i], positions[j]] = [positions[j], positions[i]];
    const [x, y] = positions[i];
    field[y][x].bomb = true;
  }

  return field;
};

const init = () => {
  let field = [];
  for (let y = 0; y < height; y++) {
    let row = [];
    for (let x = 0; x < width; x++) {
      row.push(new Cell(x, y));
    }
    field.push(row);
  }
  return generateBombs(field, bombs);
};

let field = init();

const render = () => {
  root.innerHTML = "";
  const fragment = document.createDocumentFragment();

  eachCell((cell) => {
    let cellElement = document.createElement("div");
    cellElement.classList.add("cell", "closed", `size-${size}`);
    cellElement.dataset.x = cell.x;
    cellElement.dataset.y = cell.y;
    fragment.appendChild(cellElement);
  });

  root.appendChild(fragment);
};

render();

const openAll = () => {
  eachCell((cell) => {
    if (!cell.open) {
      cell.open = true;
      cell.draw(field);
    }
  });
};

const gameOver = () => {
  gameStatus.textContent = "You lose :(";
  openAll();
};

const checkGameWin = () => {
  let openCells = field.flat().filter((cell) => cell.open).length;
  if (openCells === width * height - bombs) {
    gameStatus.textContent = "You win :)";
    openAll();
  }
};

const restart = () => {
  root.innerHTML = "";
  gameStatus.textContent = "";
  field = init();
  render();
  flags = bombs;
  updateFlagsCount();
  setGridStyles();
};

const setConfiguration = (settings) => {
  const configuration = validateCustomSettings(
    settings.width,
    settings.height,
    settings.bombs
  );

  width = configuration.width;
  height = configuration.height;
  bombs = configuration.bombs;

  restart();
  return configuration;
};

document.addEventListener("click", (event) => {
  const { target } = event;

  if (target.classList.contains("cell")) {
    handleCellClick(target);
  } else if (target.id === "restart") {
    restart();
  } else if (target.id === "custom") {
    customSettings.classList.toggle("_active");
  } else if (["novice", "amateur", "professional"].includes(target.id)) {
    setConfiguration(configs[target.id]);
  }
});

const handleCellClick = (target) => {
  const x = +target.dataset.x;
  const y = +target.dataset.y;
  field[y][x].click(field);
};

document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  if (event.target.classList.contains("cell")) {
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

  //validating in setConfiguration func
  bombsInput.value = setConfiguration(customSettingsObject).bombs;
  widthInput.value = setConfiguration(customSettingsObject).width;
  heightInput.value = setConfiguration(customSettingsObject).height;
});

sizeSelect.addEventListener("change", (event) => {
  size = +sizeSelect.value;
  setGridStyles();
  restart();
});
