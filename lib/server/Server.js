const http = require('http');
const Websocket = require('websocket').server;
const fs = require('fs');
const mime = require('mime-types');
const chokidar = require('chokidar');
const cheerio = require('cheerio');
const pretty = require('pretty');

class Server {
  constructor(port, rootDirectory) {
    this.port = port;
    this.rootDirectory = rootDirectory;
  }

  startHTTP() {
    console.log('starting server ', this.port, this.rootDirectory);
    this.server = http.createServer(this.onRequest.bind(this));
    this.server.listen(this.port);
    console.log(`listening on ${this.port}`);
  }

  startWebsockets() {
    if (!this.server) throw Error('No HTTP server running. Please call `startHTTP`');
    this.wsServer = new Websocket({
      httpServer: this.server,
      autoAcceptConnections: false,
    });

    this.watcher = chokidar.watch(this.rootDirectory, { ignored: /^\./, persistent: true });

    this.wsServer.on('request', (request) => {
      this.connection = request.accept(null, request.origin);
      console.log((new Date()) + ' Connection accepted.');
    });

    this.watcher.on('add', () => this.connection && this.connection.sendUTF('change'));
    this.watcher.on('change', () => this.connection && this.connection.sendUTF('change'));
  }

  onRequest(req, res) {
    let { url } = req;
    if (url.slice(-1) === '/') url = `${url}index.html`;
    let path = `${this.rootDirectory}${url}`;
    if (url === '/merge.js') {
      path = `${__dirname}/../Merge.js`;
    }
    try {
      let data = fs.readFileSync(path);
      const type = mime.lookup(path);
      if (type === 'text/html') {
        const $ = cheerio.load(data);
        console.log('$.root().html()', $.root().html());
        $('head').append(`
          <script src="/merge.js"></script>
          <script>
            let socket = new WebSocket("ws://localhost:${this.port}");
            socket.onopen = function(e) {
                console.log('Connection to merge host open');
            };
            socket.onmessage = function(event) {
                if(event.data === 'change' && location) {
                    location.reload();
                }
            };
            const merge = new Merge({
              fetch: (url) => fetch(url),
            }, document, window.mergeState);
            window.addEventListener('DOMContentLoaded', (event) => {
              merge.parse();
            });
          </script>
        `);
        data = pretty($.root().html(), { ocd: true });
      }
      res.writeHead(200, { 'Content-Type': type });
      res.write(data);
    } catch (err) {
      console.log('Caught error', err, err.stack);
      res.writeHead(404);
    }
    res.end();
  }

  start() {
    this.startHTTP();
    this.startWebsockets();
  }
}

module.exports = Server;
