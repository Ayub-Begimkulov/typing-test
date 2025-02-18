import { isNumber } from "../../../shared/utils";

export class TypingTimer {
  private intervalId: number | null = null;
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
    if (isNumber(this.intervalId)) {
      return;
    }

    this.prevTime = performance.now();
    this.intervalId = setInterval(() => {
      this.checkForTime();
    }, 1_000);
  }

  stop() {
    if (!isNumber(this.intervalId)) {
      return;
    }

    this.updateTimePassed();

    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  checkForTime() {
    if (!isNumber(this.intervalId)) {
      return;
    }

    this.updateTimePassed();

    if (this.timePassed >= this.config.duration) {
      this.finishTimer();
    } else {
      this.config.onTimeUpdate(this.timePassed);
    }
  }

  // public method since we can finish test
  // before the timer runs out. so we need the ability to
  // stop at any point
  finish() {
    if (!isNumber(this.intervalId)) {
      return;
    }

    this.updateTimePassed();
    this.finishTimer();
  }

  private finishTimer() {
    if (!isNumber(this.intervalId)) {
      return;
    }

    const { timePassed } = this;

    clearInterval(this.intervalId);
    this.intervalId = null;
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
}
