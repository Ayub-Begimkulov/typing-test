import { isNumber } from "../../../shared/utils";

export class TypingTimer {
  private timerId: number | null = null;
  private timePassed: number = 0;
  private prevTime: number | null = null;

  constructor(
    private config: {
      duration: number;
      onEnd: (timePassed: number) => void;
      onTimeUpdate: (timePassed: number) => void;
    }
  ) {}

  start() {
    if (isNumber(this.timerId)) {
      return;
    }

    this.prevTime = performance.now();

    this.setTimer();
  }

  stop() {
    if (!isNumber(this.timerId)) {
      return;
    }

    this.updateTimePassed();

    clearTimeout(this.timerId);
    this.timerId = null;
  }

  checkForTime() {
    if (!isNumber(this.timerId)) {
      return;
    }

    this.updateTimePassed();

    if (this.timePassed >= this.config.duration) {
      this.finishTimer();
    } else {
      this.config.onTimeUpdate(this.timePassed);
      this.setTimer();
    }
  }

  // public method since we can finish test
  // before the timer runs out. so we need the ability to
  // stop at any point
  finish() {
    if (!isNumber(this.timerId)) {
      return;
    }

    this.updateTimePassed();
    this.finishTimer();
  }

  private finishTimer() {
    if (!isNumber(this.timerId)) {
      return;
    }

    const { timePassed } = this;
    console.log(timePassed);
    clearTimeout(this.timerId);
    this.timerId = null;
    this.prevTime = null;
    this.timePassed = 0;

    this.config.onEnd(timePassed);
  }

  private updateTimePassed() {
    if (!isNumber(this.prevTime)) {
      return;
    }

    const now = performance.now();
    this.timePassed = this.timePassed + now - this.prevTime;
    this.prevTime = now;
  }

  private setTimer() {
    if (isNumber(this.timerId)) {
      clearTimeout(this.timerId);
    }
    const timeout = Math.min(this.config.duration - this.timePassed, 1000);
    this.timerId = setTimeout(() => {
      this.checkForTime();
    }, timeout);
  }
}
