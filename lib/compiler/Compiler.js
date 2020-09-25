const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const pretty = require('pretty');

const CompilerFetch = require('./ComplierFetch');
const Merge = require('../Merge');

class Compiler {
  compile(filePath, { rootDirectory }) {
    return new Promise((resolve) => {
      const fileSource = fs.readFileSync(filePath);
      const rootDir = rootDirectory || path.basename(filePath);
      const fetch = new CompilerFetch(rootDir, filePath);
      const merge = new Merge(fetch);
      const dom = new JSDOM(fileSource, {
        runScripts: 'dangerously',
        beforeParse: (window) => {
          // eslint-disable-next-line no-param-reassign
          window.merge = merge;
        },
      });
      merge.document = dom.window.document;
      merge.parse().then(() => resolve(pretty(dom.serialize(), { ocd: true })));
    });
  }
}

module.exports = Compiler;
