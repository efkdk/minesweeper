const root = document.getElementById("root");
const gameStatus = document.getElementById("game-status");
const restartButton = document.getElementById("restart");
const flagsCount = document.getElementById("flags-count");
const sizeSelect = document.getElementById("size-select");
const customSettings = document.getElementById("custom-settings");

//configs
let noviceConfig = {
  width: 9,
  height: 9,
  bombs: 10,
};

let amateurConfig = {
  width: 16,
  height: 16,
  bombs: 40,
};

let professionalConfig = {
  width: 30,
  height: 16,
  bombs: 99,
};

// default configuration
let { width, height, bombs } = noviceConfig;
let flags = bombs;
let size = 24;

flagsCount.textContent = flags;
root.style.gridTemplateColumns = `repeat(${width}, ${size}px)`;
root.style.gridTemplateRows = `repeat(${height}, ${size}px)`;
root.style.gap = `${size / 7}px`;

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.bomb = false;
    this.flagged = false;
    this.open = false;
  }
}

Cell.prototype.draw = function (field) {
  console.log("draw");
  flagsCount.textContent = flags;
  checkGameWin();
  const cellElement = document.querySelector(
    `[data-x="${this.x}"][data-y="${this.y}"]`
  );
  let bombsAround = this.cellsAround(field).filter((cell) => cell.bomb).length;
  cellElement.classList.value = `cell size-${size}`;
  if (this.flagged) {
    cellElement.classList.add("flagged");
  } else if (!this.open) {
    cellElement.classList.add("closed");
  } else if (this.open) {
    cellElement.classList.add("opened");
    if (this.bomb) {
      cellElement.classList.add("type10");
    } else {
      cellElement.classList.add(`type${bombsAround}`);
      if (bombsAround > 0) {
        cellElement.textContent = bombsAround;
      }
    }
  }
};

Cell.prototype.cellsAround = function (field) {
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
};

Cell.prototype.click = function (field) {
  if (this.open) {
    return;
  } else if (this.flagged) {
    return;
  } else if (this.bomb) {
    this.open = true;
    this.draw(field);
    gameOver();
  } else {
    this.open = true;
    let cells = this.cellsAround(field);
    if (cells.filter((cell) => cell.bomb).length === 0) {
      cells.forEach((cell) => {
        cell.click(field);
      });
    }
    this.draw(field);
  }
};

Cell.prototype.flag = function () {
  if (this.open) {
    return;
  } else {
    this.flagged = !this.flagged;
    this.flagged ? flags-- : flags++;
    this.draw(field);
  }
};

const eachCell = (callback) => {
  field.forEach((row) => {
    row.forEach((cell) => {
      callback(cell);
    });
  });
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
  for (let i = 0; i < bombs; i++) {
    while (true) {
      let x = Math.floor(Math.random() * width);
      let y = Math.floor(Math.random() * height);
      if (!field[y][x].bomb) {
        field[y][x].bomb = true;
        break;
      }
    }
  }
  return field;
};

let field = init();

const render = () => {
  root.innerHTML = "";
  root.style.gridTemplateColumns = `repeat(${width}, ${size}px)`;
  root.style.gridTemplateRows = `repeat(${height}, ${size}px)`;
  root.style.gap = `${size / 7}px`;
  eachCell((cell) => {
    let cellElement = document.createElement("div");
    cellElement.classList.add("cell", "closed", `size-${size}`);
    cellElement.dataset.x = cell.x;
    cellElement.dataset.y = cell.y;
    root.append(cellElement);
  });
};

render();

const openAll = () => {
  eachCell((cell) => {
    cell.open = true;
  });
  draw();
};

function draw() {
  eachCell((cell) => {
    cell.draw(field);
  });
}
const gameOver = () => {
  gameStatus.textContent = "You lose :(";
  openAll();
};

const checkGameWin = () => {
  let openCells = 0;
  eachCell((cell) => {
    if (cell.open) {
      openCells++;
    }
  });
  if (openCells === width * height - bombs) {
    gameStatus.textContent = "You win :)";
    openAll();
  }
};

const restart = () => {
  root.innerHTML = "";
  gameStatus.textContent = "";
  field = init();
  console.log(field);
  render();
  flags = bombs;
  flagsCount.textContent = flags;
};

const setConfiguration = (settings) => {
  width = +settings.width;
  height = +settings.height;
  bombs = +settings.bombs;
  restart();
};

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("cell")) {
    const x = +event.target.dataset.x,
      y = +event.target.dataset.y;
    field[y][x].click(field);

    let cells = field[y][x].cellsAround(field);
    let bombsAround = cells.filter((cell) => cell.bomb).length;
    let flagsAround = cells.filter((cell) => cell.flagged).length;
    if (bombsAround === flagsAround && bombsAround > 0) {
      cells.forEach((cell) => {
        if (!cell.flagged) {
          cell.click(field);
        }
      });
    }
  }

  if (event.target.id === "restart") {
    restart();
  }

  if (event.target.id === "custom") {
    customSettings.classList.toggle("_active");
  }

  if (event.target.id === "novice" || "amateur" || "professional") {
    switch (event.target.id) {
      case "novice": {
        setConfiguration(noviceConfig);
        break;
      }
      case "amateur": {
        setConfiguration(amateurConfig);
        break;
      }
      case "professional": {
        setConfiguration(professionalConfig);
        break;
      }
    }
  }
});

document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  if (event.target.classList.contains("cell")) {
    const x = +event.target.dataset.x,
      y = +event.target.dataset.y;
    field[y][x].flag();
  }
});

customSettings.addEventListener("submit", (event) => {
  event.preventDefault();
  let widthFromSettings = +widthInput.value;
  let heightFromSettings = +heightInput.value;
  let bombsFromSettings = +bombsInput.value;
  //min max bombs
  if ((widthFromSettings * heightFromSettings) / bombsFromSettings <= 4) {
    bombsInput.value = Math.floor((widthFromSettings * heightFromSettings) / 4);
    bombsFromSettings = +bombsInput.value;
  } else if (
    (widthFromSettings * heightFromSettings) / bombsFromSettings >=
    15
  ) {
    bombsInput.value = Math.floor(
      (widthFromSettings * heightFromSettings) / 15
    );
    bombsFromSettings = +bombsInput.value;
  }
  let customSettingsObject = {
    width: widthFromSettings,
    height: heightFromSettings,
    bombs: bombsFromSettings,
  };
  setConfiguration(customSettingsObject);
});

sizeSelect.addEventListener("change", (event) => {
  size = +sizeSelect.value;
  render();
});
