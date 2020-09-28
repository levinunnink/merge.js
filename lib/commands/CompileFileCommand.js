const autoBind = require('auto-bind');
const Compiler = require('../compiler/Compiler');

class CompileFileCommand {
  constructor() {
    this.compiler = new Compiler();
    autoBind(this);
  }

  async handle(filePath, options) {
    const { rootDirectory } = options;
    const html = await this.compiler.compile(filePath, { rootDirectory });
    return {
      filePath,
      data: html,
    };
  }
}

module.exports = CompileFileCommand;
