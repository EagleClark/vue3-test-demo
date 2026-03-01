const TOKEN_KEY = 'auth_token'
const USER_KEY = 'user_info'

export const storage = {
  // Token 相关
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY)
  },

  // 用户信息相关
  getUser<T>(): T | null {
    const user = localStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  },

  setUser<T>(user: T): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  removeUser(): void {
    localStorage.removeItem(USER_KEY)
  },

  // 清除所有认证信息
  clearAuth(): void {
    this.removeToken()
    this.removeUser()
  }
}