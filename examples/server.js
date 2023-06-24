const getPort = require('get-port');
const openUrl = require('openurl');

const Server = require('../lib/server/Server');

const run = async () => {
  const root = "/Users/lnunnink/Projects/merge/test";
  const port = await getPort();

  const server = new Server(port, root);
  server.start();

  openUrl.open(`http://localhost:${port}`);
};

run();
