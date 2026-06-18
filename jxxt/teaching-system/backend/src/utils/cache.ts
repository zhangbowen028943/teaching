import NodeCache from 'node-cache';
import { Stats } from 'node-cache';

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
   * @param key - 缓存键
   * @returns 缓存值，不存在返回 undefined
   */
  get<T = any>(key: string): T | undefined {
    return cache.get<T>(key);
  },

  /**
   * 设置缓存
   * @param key - 缓存键
   * @param value - 缓存值
   * @param ttl - 过期时间（秒），默认 60 秒
   * @returns 是否设置成功
   */
  set<T = any>(key: string, value: T, ttl?: number): boolean {
    if (ttl !== undefined) {
      return cache.set(key, value, ttl);
    }
    return cache.set(key, value);
  },

  /**
   * 删除缓存
   * @param key - 缓存键
   * @returns 删除的条目数
   */
  del(key: string): number {
    return cache.del(key);
  },

  /**
   * 清空所有缓存
   */
  flush(): void {
    cache.flushAll();
  },

  /**
   * 获取缓存统计
   * @returns 缓存统计信息
   */
  getStats(): Stats {
    return cache.getStats();
  },

  /**
   * 获取所有缓存键
   * @returns 缓存键列表
   */
  keys(): string[] {
    return cache.keys();
  },
};

export default cacheUtil;