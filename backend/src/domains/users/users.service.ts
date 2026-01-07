import { prisma } from '../../infrastructure/database/prisma.js';

interface UpdateUserInput {
  name?: string;
  email?: string;
  language?: string;
}

export const usersService = {
  async getById(id: string) {
    const user = await prisma.users.findUnique({
      where: { id },
      include: {
        client_profiles: { select: { name: true, email: true } },
        drivers: { select: { name: true } },
      },
    });

    if (!user) return null;

    // Return with name/email from appropriate profile
    const name = user.client_profiles?.name || user.drivers?.name || null;
    const email = user.client_profiles?.email || null;

    return {
      id: user.id,
      phone: user.phone,
      name,
      email,
      role: user.role,
      language: user.language,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  },

  async update(id: string, data: UpdateUserInput) {
    // Get user to check their role
    const user = await prisma.users.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Update language on User (shared)
    if (data.language) {
      await prisma.users.update({
        where: { id },
        data: { language: data.language },
      });
    }

    // Update name based on user role
    if (data.name) {
      if (user.role === 'DRIVER') {
        // Update name on Driver table
        await prisma.drivers.update({
          where: { user_id: id },
          data: { name: data.name },
        });
      } else {
        // Update name/email on ClientProfile for clients
        await prisma.client_profiles.upsert({
          where: { user_id: id },
          update: {
            name: data.name,
            ...(data.email && { email: data.email }),
          },
          create: {
            user_id: id,
            name: data.name,
            email: data.email,
          },
        });
      }
    } else if (data.email) {
      // Only email update (for clients)
      await prisma.client_profiles.upsert({
        where: { user_id: id },
        update: { email: data.email },
        create: {
          user_id: id,
          name: 'User',
          email: data.email,
        },
      });
    }

    // Return updated user
    return this.getById(id);
  },
};
