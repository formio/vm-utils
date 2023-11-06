const fs = require('fs');

const lodashCode = fs.readFileSync('./node_modules/lodash/lodash.min.js', 'utf8');
const momentCode = fs.readFileSync('./node_modules/moment/min/moment.min.js', 'utf8');
const formioCode = fs.readFileSync('./node_modules/formiojs/dist/formio.full.js', 'utf8');
const globalCode = `
var Text              = class {};
var HTMLElement       = class {};
var HTMLCanvasElement = class {};
var navigator         = {userAgent: ''};
var document          = {
  createElement: () => ({}),
  cookie: '',
  getElementsByTagName: () => [],
  documentElement: {
    style: [],
    firstElementChild: {appendChild: () => {}}
  }
};
var window = {addEventListener: () => {}, Event: function() {}, navigator: global.navigator};
var btoa = (str) => {
  return (str instanceof Buffer) ?
    str.toString('base64') :
    Buffer.from(str.toString(), 'binary').toString('base64');
};
var setTimeout = () => {};
var self = global;
`;

class ContextBuilder {
  constructor(isolate) {
    this._isolate = isolate;
    this._context = null;
  }

  create() {
    this._context = this._isolate.createContextSync();
    const jail = this._context.global;
    // Set up a reference to the global object
    jail.setSync('global', jail.derefInto());
    return this;
  }

  async createAsync() {
    this._context = await this._isolate.createContext();
    const jail = this._context.global;
    // Set up a reference to the global object
    await jail.set('global', jail.derefInto());
    return this;
  }

  withLodash() {
    this._context.evalSync(lodashCode);
    return this;
  }

  async withLodashAsync() {
    await this._context.eval(lodashCode);
    return this;
  }

  withMoment() {
    this._context.evalSync(momentCode);
    return this;
  }

  async withMomentAsync() {
    await this._context.eval(momentCode);
    return this;
  }

  withFormio() {
    this._context.evalSync(globalCode);
    this._context.evalSync(formioCode);
    return this;
  }

  async withFormioAsync() {
    await this._context.eval(globalCode);
    await this._context.eval(formioCode);
    return this;
  }

  build() {
    return this._context;
  }
}

module.exports = ContextBuilder;