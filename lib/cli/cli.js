const commander = require('commander');
const autoBind = require('auto-bind');
const packageInfo = require('../../package.json');
const CompileDirectoryCommand = require('../commands/CompileDirectoryCommand');
const StartServerCommand = require('../commands/StartServerCommand');

class MergeCLI {
  constructor() {
    this.commander = commander;
    this.commander.version(packageInfo.version);
    this.compileDirectoryCommand = new CompileDirectoryCommand();
    this.startServerCommand = new StartServerCommand();
    autoBind(this);
  }

  parse(argv) {
    this.commander.command('watch <directory>')
      .description('Watches a local directory using the merge runtime')
      .action(this.startServerCommand.handle);
    this.commander.command('build <directory> [destinationPath]')
      .description('Compiles the local HTML and outputs it to the destination path')
      .action(this.compileDirectoryCommand.handle);
    this.commander.parse(argv);
    if (!argv.slice(2).length) {
      this.commander.outputHelp();
    }
  }
}

module.exports = new MergeCLI();
