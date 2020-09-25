const fs = require('fs');
const path = require('path');
const autoBind = require('auto-bind');

const { mkDirByPathSync } = require('../utils/utils');
const Compiler = require('../compiler/Compiler');

class CompileFileCommand {
  constructor() {
    this.compiler = new Compiler();
    autoBind(this);
  }

  async handle(filePath, options) {
    const { destinationPath, rootDirectory } = options;
    const html = await this.compiler.compile(filePath, { rootDirectory });
    const compiledDestinationPath = `${destinationPath}/${path.basename(filePath)}`;
    mkDirByPathSync(path.dirname(compiledDestinationPath));
    fs.writeFileSync(compiledDestinationPath, html);
    return html;
  }
}

module.exports = CompileFileCommand;
