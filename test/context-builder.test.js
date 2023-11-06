const getIsolate = require('../src/get-isolate');
const ContextBuilder = require('../src/context-builder');
const { expect } = require('chai');
const moment = require('moment');

describe('Test ContextBuilder', () => {
  const isolate = getIsolate(64);
  it('should create a context with lodash', () => {
    const context = new ContextBuilder(isolate)
      .create()
      .withLodash()
      .build();

    const result = context.evalSync('_.some([1,2,3], (n) => n > 2)');
    expect(result).to.equal(true);
  });

  it('should create a context with moment', () => {
    const context = new ContextBuilder(isolate)
      .create()
      .withMoment()
      .build();

    const result = context.evalSync('moment().format("YYYY-MM-DD")');
    expect(result).to.equal(moment().format('YYYY-MM-DD'));
  });

  it('should create a context with formio', () => {
    const context = new ContextBuilder(isolate)
      .create()
      .withFormio()
      .build();

    const result = context.evalSync('Formio.version');
    expect(result).to.not.equal(undefined);
  });

  it('should create a context with lodash asynchronously', async () => {
    const builder = new ContextBuilder(isolate);
    const context = await builder
      .create()
      .withLodash()
      .build();

    const result = await context.eval('_.some([1,2,3], (n) => n > 2)');
    expect(result).to.equal(true);
  });

  it('should create a context with moment asynchronously', async () => {
    const builder = new ContextBuilder(isolate);
    const context = await builder
      .create()
      .withMoment()
      .build();

    const result = await context.eval('moment().format("YYYY-MM-DD")');
    expect(result).to.equal(moment().format('YYYY-MM-DD'));
  });

  it('should create a context with formio asynchronously', async () => {
    const builder = new ContextBuilder(isolate);
    const context = await builder
      .create()
      .withFormio()
      .build();

    const result = await context.eval('Formio.version');
    expect(result).to.not.equal(undefined);
  });
});