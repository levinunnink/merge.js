const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const autoBind = require('auto-bind');
const CompileFileCommand = require('./CompileFileCommand');

const { resolve } = path;
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

class CompileDirectoryPath {
  constructor() {
    autoBind(this);
  }

  async handle(directoryPath, options) {
    console.log('Build', directoryPath, options);
    const files = await this.getFiles(directoryPath);
    const compilePromises = [];
    files.forEach((file) => {
      // A little tortured logic to construct the destination path
      let { destinationPath } = options;
      if (!destinationPath) {
        destinationPath = `${directoryPath}/build`;
      }
      const fileOptions = {
        ...options,
        destinationPath,
        rootDirectory: directoryPath,
      };
      compilePromises.push((new CompileFileCommand()).handle(file, fileOptions));
    });
    return Promise.all(compilePromises);
  }

  async getFiles(directoryPath) {
    const subdirs = await readdir(directoryPath);
    const files = await Promise.all(subdirs.map(async (subdir) => {
      const res = resolve(directoryPath, subdir);
      return (await stat(res)).isDirectory() ? this.getFiles(res) : res;
    }));
    return files.reduce((a, f) => a.concat(f), []).filter((file) => path.extname(file) === '.html');
  }
}

module.exports = CompileDirectoryPath;
