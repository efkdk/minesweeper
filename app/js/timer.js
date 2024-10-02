import { updateTimer } from "./helpers.js";

class TimerClass {
  constructor() {
    this.seconds = 0;
    this.timer;
  }

  start() {
    this.timer = setInterval(() => {
      this.seconds++;
      updateTimer(this.seconds);
    }, 1000);
  }

  stop() {
    clearInterval(this.timer);
    this.seconds = 0;
  }

  reset() {
    clearInterval(this.timer);
    this.seconds = 0;
    updateTimer(this.seconds);
  }
}

const Timer = new TimerClass();

export default Timer;
