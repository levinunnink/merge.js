const getPort = require('get-port');
const openUrl = require('openurl');
const autoBind = require('auto-bind');
const chalk = require('chalk');

const mergeConsole = require('../utils/console');
const Server = require('../server/Server');

class StartServerCommand {
  constructor() {
    autoBind(this);
    this.getPort = getPort;
  }

  async handle(directoryPath) {
    mergeConsole.animate('Starting merge dev server');
    const port = await this.getPort();
    const server = new Server(port, directoryPath);
    server.on('ready', () => {
      mergeConsole.clear();
      mergeConsole.print(`Server is listening on ${chalk.underline(chalk.green(`http://localhost:${port}`))}`);
    });
    server.on('error', (error) => {
      mergeConsole.error(`${error}\n`);
    });
    server.on('load', (path) => {
      mergeConsole.print(`Loading ${chalk.green(path)}`);
    });
    server.start();
    openUrl.open(`http://localhost:${port}`);
  }
}

module.exports = StartServerCommand;
