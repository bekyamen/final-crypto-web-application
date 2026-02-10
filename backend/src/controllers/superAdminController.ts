import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// --- Create Admin or Super Admin ---
export const createAdminOrSuperAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!Object.values(UserRole).includes(role as UserRole) || role === 'USER') {
      return res.status(400).json({ message: 'Role must be ADMIN or SUPER_ADMIN.' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
      },
    });

    return res.status(201).json({ message: `${role} created successfully.`, userId: user.id });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// --- Reset Admin Password ---
export const resetAdminPassword = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required.' });
    }

    // Find the user
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role !== 'ADMIN') {
      return res.status(400).json({ message: 'Only ADMIN passwords can be reset.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user password and force password reset flag
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        forcePasswordReset: true, // Make sure your schema has this field
        passwordUpdatedAt: new Date(),
      },
    });

    return res.status(200).json({ message: 'Admin password reset successfully.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
