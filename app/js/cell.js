import Context from "./context.js";
import { decrementFlagsCount, incrementFlagsCount } from "./helpers.js";
import {
  checkBombsAround,
  checkGameWin,
  gameOver,
  openNeighborCells,
} from "./game.js";
import Timer from "./timer.js";

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.bomb = false;
    this.flagged = false;
    this.open = false;
  }

  draw() {
    const { size } = Context.getState();
    const cellElement = document.querySelector(
      `[data-x="${this.x}"][data-y="${this.y}"]`
    );
    const bombsAround = checkBombsAround(this);
    let classes = ["cell", `size-${size}`];
    if (this.flagged) {
      classes.push("flagged");
      classes.push("closed");
    } else if (!this.open) {
      classes.push("closed");
    } else {
      classes.push("opened");
      this.bomb ? classes.push("type10") : classes.push(`type${bombsAround}`);
    }

    cellElement.className = classes.join(" ");
  }

  /**
   * @param {Array} field
   * @returns {Object}
   */
  cellsAround(field) {
    let cells = [];
    const { width, height } = Context.getState();
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
    const bombsAround = checkBombsAround(this, field);
    const openedCells = field.flat().filter((cell) => cell.open).length;
    if (openedCells === 0) {
      Timer.start();
    }
    if ((this.open && bombsAround === 0) || this.flagged) return;
    if (this.bomb) {
      gameOver(field);
      return;
    }

    if (this.open && bombsAround > 0) {
      let flagsAround = this.cellsAround(field).filter(
        (cell) => cell.flagged
      ).length;
      if (flagsAround === bombsAround) {
        this.cellsAround(field)
          .filter((cell) => !cell.open && !cell.flagged)
          .forEach((neighbor) => {
            neighbor.click(field);
          });
      }
    }

    this.open = true;

    if (!this.bomb) {
      openNeighborCells(this, field);
    }

    checkGameWin(field);
  }

  flag() {
    if (this.open) return;

    this.flagged = !this.flagged;
    this.flagged ? decrementFlagsCount() : incrementFlagsCount();
    this.draw();
  }

  startSpying(field) {
    if (checkBombsAround(this) === 0 || !this.open) return;
    const closedCells = this.cellsAround(field).filter((cell) => !cell.open);
    closedCells.forEach((cell) => {
      if (!cell.flagged) {
        const cellElement = document.querySelector(
          `[data-x="${cell.x}"][data-y="${cell.y}"]`
        );
        cellElement.classList.remove("closed");
        cellElement.classList.add("opened");
      }
    });
  }

  stopSpying(field) {
    const closedCells = this.cellsAround(field).filter((cell) => !cell.open);
    closedCells.forEach((cell) => {
      const cellElement = document.querySelector(
        `[data-x="${cell.x}"][data-y="${cell.y}"]`
      );
      cellElement.classList.add("closed");
      cellElement.classList.remove("opened");
    });
  }
}

export default Cell;
