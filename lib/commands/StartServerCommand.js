const getPort = require('get-port');
const openUrl = require('openurl');
const autoBind = require('auto-bind');

const Server = require('../server/Server');

class StartServerCommand {
  constructor() {
    autoBind(this);
    this.getPort = getPort;
  }

  async handle(directoryPath) {
    const port = await this.getPort();
    const server = new Server(port, directoryPath);
    server.start();
    openUrl.open(`http://localhost:${port}`);
  }
}

module.exports = StartServerCommand;
