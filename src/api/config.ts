/**
 * API 配置
 */

// 是否使用模拟 API（可通过环境变量 VITE_USE_MOCK=false 关闭）
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

// API 基础地址
export const API_BASE_URL = '/api'

// 请求超时时间（毫秒）
export const API_TIMEOUT = 10000