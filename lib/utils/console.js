const chalk = require('chalk');
const ProgressBar = require('progress');
const readline = require('readline');
const debug = require('debug')('merge');

class MergeConsole {
  constructor() {
    this.animationString = '⠋⠙⠚⠞⠖⠦⠴⠲⠳⠓';
    this.animateInterval = null;
    this.stream = process.stdout;
    this.debugger = debug;
  }

  update(string, animate = true) {
    clearInterval(this.animateInterval);
    if (animate) {
      this.animate(string);
    } else {
      this.stream.cursorTo(0);
      this.stream.write(string);
      this.stream.clearLine(1);
    }
  }

  clear() {
    clearInterval(this.animateInterval);
    this.stream.cursorTo(0);
    this.stream.write('');
    this.stream.clearLine(1);
  }

  debug(string, ...args) {
    this.debugger(string, args);
  }

  log(string, args = null) {
    this.stream.write(string, args);
  }

  print(string, args = null) {
    this.stream.write(string, args);
    this.stream.write('\n');
  }

  error(string) {
    clearInterval(this.animateInterval);
    this.stream.cursorTo(0);
    this.stream.write(chalk.red(string));
    this.stream.clearLine(1);
  }

  animate(string) {
    const animationObjects = this.animationString.split('');
    let animationStep = 0;
    const stream = process.stdout;
    this.animateInterval = setInterval(() => {
      if (!stream) return;
      if (animationObjects.length === animationStep) animationStep = 0;
      const curAnimation = chalk.green(animationObjects[animationStep]);
      stream.cursorTo(0);
      stream.write(`${curAnimation} ${string}`);
      stream.clearLine(1);
      animationStep += 1;
    }, 60);
  }

  async getInput(message) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    return new Promise((resolve) => {
      rl.question(message, (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }

  progress(string, total) {
    this.bar = new ProgressBar(`${string} [:bar] :percent`, {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total,
    });
    return this.bar;
  }
}

module.exports = new MergeConsole();
