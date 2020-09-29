const autoBind = require('auto-bind');
const chalk = require('chalk');

const Compiler = require('../compiler/Compiler');
const mergeConsole = require('../utils/console');

class CompileFileCommand {
  constructor() {
    this.compiler = new Compiler();
    autoBind(this);
  }

  async handle(filePath, options) {
    const { rootDirectory } = options;
    mergeConsole.print(`Building ${chalk.green(filePath)}`, true);
    const html = await this.compiler.compile(filePath, { rootDirectory });
    return {
      filePath,
      data: html,
    };
  }
}

module.exports = CompileFileCommand;
