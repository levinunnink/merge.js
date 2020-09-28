const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const autoBind = require('auto-bind');
const CompileFileCommand = require('./CompileFileCommand');
const { mkDirByPathSync } = require('../utils/utils');
const mergeConsole = require('../utils/console');

const { resolve } = path;
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

class CompileDirectoryPath {
  constructor() {
    autoBind(this);
  }

  async handle(directoryPath, destinationPath) {
    mergeConsole.animate(`Building ${directoryPath}`);
    const files = await this.getFiles(directoryPath);
    const htmlFiles = files.filter((file) => path.extname(file) === '.html');
    const otherFiles = files.filter((file) => path.extname(file) !== '.html');
    const compilePromises = [];
    htmlFiles.forEach((file) => {
      const fileOptions = {
        rootDirectory: directoryPath,
      };
      compilePromises.push(new CompileFileCommand().handle(file, fileOptions));
    });
    otherFiles.forEach((file) => {
      compilePromises.push(new Promise((res) => {
        res({
          filePath: file,
          data: fs.readFileSync(file),
        });
      }));
    });

    const compiledOutput = await Promise.all(compilePromises);

    compiledOutput.forEach(({
      filePath, data,
    }) => {
      const actualDestination = filePath.replace(path.resolve(directoryPath), '');
      const compiledDestinationPath = `${destinationPath}${actualDestination}`;
      mkDirByPathSync(path.dirname(compiledDestinationPath));
      fs.writeFileSync(compiledDestinationPath, data);
    });
    mergeConsole.clear();
  }

  async getFiles(directoryPath, withExtension) {
    const subdirs = await readdir(directoryPath);
    const files = await Promise.all(subdirs.map(async (subdir) => {
      const res = resolve(directoryPath, subdir);
      return (await stat(res)).isDirectory() ? this.getFiles(res) : res;
    }));
    return files.reduce((a, f) => a.concat(f), []).filter(
      (file) => (withExtension ? path.extname(file) === withExtension : true),
    );
  }
}

module.exports = CompileDirectoryPath;
