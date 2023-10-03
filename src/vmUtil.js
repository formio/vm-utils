'use strict';

const {Isolate} = require('isolated-vm');

// Each function has sync and async implementations

// Recursive function that transfers objects, arrays, functions and primitives
// With all the child properties and prototype
async function _transfer(key, value, dest, visited, c) {
  // Handle circular links
  if (visited.has(value)) {
    await c.evalClosure(`${dest}['${key}'] = eval($0)`, [visited.get(value)]);
    return;
  }

  // Handle function
  if (typeof value === 'function') {
    // Bind functions
    await c.evalClosure(`${dest}['${key}'] = $0`, [value]);
  }
  // Handle primitives
  else if (typeof value !== 'object' || value === null) {
    await c.evalClosure(`${dest}['${key}'] = $0`, [value]);
    // Handle primitives
    if (
      value === null ||
      value === undefined ||
      typeof value === 'number' ||
      typeof value === 'string' ||
      typeof value === 'boolean' ||
      typeof value === 'undefined'
    ) {
      // Primitives are transferable
      return;
    }
  }
  // Handle arrays
  else if (value instanceof Array) {
    await c.evalClosure(`${dest}['${key}'] = []`, []);
  }
  // Handle objects
  else if (typeof value === 'object') {
    await c.evalClosure(`${dest}['${key}'] = {}`, []);
    // Transfer prototype
    for (let p in value.__proto__) {
      if (typeof value.__proto__[p] === 'function') {
        // TODO: check which isolate is used for executing callbacks
        await c.evalClosure(`${dest}['${key}']['${p}'] = $0`, [(...args) => value.__proto__[p].apply(value, args)])
      }
      else {
        await c.evalClosure(`${dest}['${key}']['${p}'] = $0`, [value.__proto__[p]]);
      }
    }
  }

  // Add to map for resolving circluar links
  visited.set(value, `${dest}['${key}']`);
  // Recursive call on child properties
  for (const p of Object.keys(value)) {
    await _transfer(p, value[p], `${dest}['${key}']`, visited, c);
  }
}

// Deeply transfers object to isolate
// Keepilng its prototype and callable objects
async function transfer(name, value, context) {
  await _transfer(name, value, 'globalThis', new Map(), context);
}

// Transfers function to isolate in the way it will be owned by targeted isolate
async function transferFn(name, fn, context) {
  // Target function should be serializable into string
  await context.evalSync(`${name} = ${fn.toString()}`);
}

// Transfers value and freezes it inside isolate environment
async function freeze(name, value, context) {
  await transfer(name, value, context);
  await context.evalClosure(`Object.freeze(${name})`);
}

// Recursive function that transfers objects, arrays, functions and primitives
// With all the child properties and prototype
function _transferSync(key, value, dest, visited, c) {
  // Handle circular links
  if (visited.has(value)) {
    c.evalClosureSync(`${dest}['${key}'] = eval($0)`, [visited.get(value)]);
    return;
  }

  // Handle function
  if (typeof value === 'function') {
    // Bind functions
    c.evalClosureSync(`${dest}['${key}'] = $0`, [value]);
  }
  // Handle primitives
  else if (typeof value !== 'object' || value === null) {
    c.evalClosureSync(`${dest}['${key}'] = $0`, [value]);
    // Handle primitives
    if (
      value === null ||
      value === undefined ||
      typeof value === 'number' ||
      typeof value === 'string' ||
      typeof value === 'boolean' ||
      typeof value === 'undefined'
    ) {
      // Primitives are transferable
      return;
    }
  }
  // Handle arrays
  else if (value instanceof Array) {
    c.evalClosureSync(`${dest}['${key}'] = []`, []);
  }
  // Handle objects
  else if (typeof value === 'object') {
    c.evalClosureSync(`${dest}['${key}'] = {}`, []);
    // Transfer prototype
    for (let p in value.__proto__) {
      if (typeof value.__proto__[p] === 'function') {
        // TODO: check which isolate is used for executing callbacks
        c.evalClosureSync(`${dest}['${key}']['${p}'] = $0`, [(...args) => value.__proto__[p].apply(value, args)])
      }
      else {
        c.evalClosureSync(`${dest}['${key}']['${p}'] = $0`, [value.__proto__[p]]);
      }
    }
  }

  // Add to map for resolving circluar links
  visited.set(value, `${dest}['${key}']`);
  // Recursive call on child properties
  for (const p of Object.keys(value)) {
    _transferSync(p, value[p], `${dest}['${key}']`, visited, c);
  }
}

// Deeply transfers object to isolate
// Keepilng its prototype and callable objects
function transferSync(name, value, context) {
   _transferSync(name, value, 'globalThis', new Map(), context);
}

// Transfers function to isolate in the way it will be owned by targeted isolate
function transferFnSync(name, fn, context) {
  // Target function should be serializable into string
  context.evalSync(`${name} = ${fn.toString()}`);
}

// Transfers value and freezes it inside isolate environment
function freezeSync(name, value, context) {
  transferSync(name, value, context);
  context.evalClosureSync(`Object.freeze(${name})`);
}

module.exports = {
  transfer,
  transferFn,
  freeze,
  transferSync,
  transferFnSync,
  freezeSync,
  Isolate
};
