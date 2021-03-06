const nodeFetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

class CompilerFetch {
  constructor(rootDir, localFile) {
    this.rootDir = rootDir;
    this.localFile = localFile;
  }

  fetch(fetchPath) {
    if (fetchPath.indexOf('https://') === 0 || fetchPath.indexOf('http://') === 0) return nodeFetch(fetchPath);
    let localFilePath;
    // Relative path
    if (fetchPath.indexOf('/') !== 0) {
      localFilePath = path.resolve(
        path.dirname(this.localFile),
        fetchPath,
      );
    }
    // Absolute path
    if (fetchPath.indexOf('/') === 0) {
      localFilePath = path.join(
        this.rootDir,
        fetchPath,
      );
    }
    return {
      text: () => (fs.readFileSync(localFilePath, 'utf8')),
      json: () => (JSON.parse(fs.readFileSync(localFilePath))),
    };
  }
}

module.exports = CompilerFetch;
