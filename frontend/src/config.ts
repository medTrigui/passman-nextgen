export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
    mockEnabled: import.meta.env.VITE_ENABLE_MOCK_API === 'true',
    loggingEnabled: import.meta.env.VITE_ENABLE_API_LOGGING === 'true',
  },
  auth: {
    tokenKey: import.meta.env.VITE_JWT_STORAGE_KEY || 'passman_token',
    refreshTokenKey: import.meta.env.VITE_REFRESH_TOKEN_KEY || 'passman_refresh_token',
  },
  development: {
    testUsername: import.meta.env.VITE_DEV_USERNAME || 'testuser',
    testPassword: import.meta.env.VITE_DEV_PASSWORD || 'password',
  },
} as const;

export type Config = typeof config; 