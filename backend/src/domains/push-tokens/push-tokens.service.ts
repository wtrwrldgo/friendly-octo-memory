import { prisma } from '../../infrastructure/database/prisma.js';

export const pushTokensService = {
  /**
   * Register or update a push token for a user
   * Uses upsert to handle token re-registration
   */
  async register(userId: string, token: string, platform: string) {
    return prisma.push_tokens.upsert({
      where: { token },
      update: {
        user_id: userId,
        platform,
        updated_at: new Date(),
      },
      create: {
        user_id: userId,
        token,
        platform,
      },
    });
  },

  /**
   * Unregister a push token (user logged out or disabled notifications)
   */
  async unregister(token: string) {
    return prisma.push_tokens.deleteMany({
      where: { token },
    });
  },

  /**
   * Get all push tokens for a user
   */
  async getByUserId(userId: string) {
    return prisma.push_tokens.findMany({
      where: { user_id: userId },
    });
  },
};
