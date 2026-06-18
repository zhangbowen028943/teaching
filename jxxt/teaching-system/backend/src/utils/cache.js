const NodeCache = require('node-cache');

const cache = new NodeCache({
  stdTTL: 60, // 默认 TTL 60 秒
  checkperiod: 120, // 每 120 秒检查过期项
  useClones: false,
});

/**
 * 缓存工具类
 * 封装 node-cache，提供 get/set/del/flush 方法
 */
const cacheUtil = {
  /**
   * 获取缓存
   * @param {String} key - 缓存键
   * @returns {*} 缓存值，不存在返回 undefined
   */
  get(key) {
    return cache.get(key);
  },

  /**
   * 设置缓存
   * @param {String} key - 缓存键
   * @param {*} value - 缓存值
   * @param {Number} [ttl] - 过期时间（秒），默认 60 秒
   * @returns {Boolean} 是否设置成功
   */
  set(key, value, ttl) {
    if (ttl !== undefined) {
      return cache.set(key, value, ttl);
    }
    return cache.set(key, value);
  },

  /**
   * 删除缓存
   * @param {String} key - 缓存键
   * @returns {Number} 删除的条目数
   */
  del(key) {
    return cache.del(key);
  },

  /**
   * 清空所有缓存
   */
  flush() {
    cache.flushAll();
  },

  /**
   * 获取缓存统计
   * @returns {Object} 缓存统计信息
   */
  getStats() {
    return cache.getStats();
  },

  /**
   * 获取所有缓存键
   * @returns {Array} 缓存键列表
   */
  keys() {
    return cache.keys();
  },
};

module.exports = cacheUtil;