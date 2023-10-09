const ivm = require('isolated-vm');

const DEFAULT_MEMORY_LIMIT = 16;

function newIsolate(memoryLimit) {
  return new ivm.Isolate({
    memoryLimit: memoryLimit |
                 process.env.VM_MEMORY_LIMIT |
                 DEFAULT_MEMORY_LIMIT
  });
}

module.exports = {
  newIsolate,
  ...require('./src/vmUtil')
}
