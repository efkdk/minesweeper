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
    this.stop();
    updateTimer(this.seconds);
  }

  getTime() {
    const hours = Math.floor(this.seconds / 3600);
    const minutes = Math.floor((this.seconds % 3600) / 60);
    const seconds = this.seconds % 60;
    return { hours, minutes, seconds };
  }
}

const Timer = new TimerClass();

export default Timer;
