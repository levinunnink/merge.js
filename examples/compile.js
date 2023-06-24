const CompileDirectoryCommand = require('../lib/commands/CompileDirectoryCommand');

const command = new CompileDirectoryCommand();

command.handle(`${__dirname}`, {
  destinationPath: `${__dirname}/../build`
});
