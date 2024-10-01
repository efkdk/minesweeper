import Context from "./context.js";
import { decrementFlagsCount, incrementFlagsCount } from "./helpers.js";
import {
  checkBombsAround,
  checkGameWin,
  gameOver,
  openNeighborCells,
} from "./game.js";

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
    if (this.bomb) {
      gameOver(field);
      return;
    }
    const bombsAround = checkBombsAround(this, field);
    if ((this.open && bombsAround === 0) || this.flagged) return;
    this.open = true;

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
}

export default Cell;
