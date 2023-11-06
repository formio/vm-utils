const cache = new WeakMap();

module.exports = {
  get(key) {
    return cache.get(key);
  }, set(key, value) {
    cache.set(key, value);
  }
};