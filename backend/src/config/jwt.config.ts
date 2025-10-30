export const jwtConfig = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key-change-in-production',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
  accessTokenExpiry: '24h' as const, // 15 minutes
  refreshTokenExpiry: '7d' as const, // 7 days
};