import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/* =====================================================
   CREATE ADMIN / SUPER ADMIN
===================================================== */
export const createAdminOrSuperAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!Object.values(UserRole).includes(role) || role === 'USER') {
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
        isActive: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: `${role} created successfully.`,
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/* =====================================================
   GET ADMINS (Pagination + Search + Filter + Sort)
===================================================== */
export const getAdminHistory = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '10',
      search = '',
      role,
      isActive,
      sort = 'desc',
    } = req.query;

    const pageNumber = parseInt(page as string);
    const pageSize = parseInt(limit as string);
    const skip = (pageNumber - 1) * pageSize;

    const filters: any = {
      role: { in: ['ADMIN', 'SUPER_ADMIN'] },
    };

    if (search) {
      filters.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (role && ['ADMIN', 'SUPER_ADMIN'].includes(role as string)) {
      filters.role = role;
    }

    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    const [admins, total] = await Promise.all([
      prisma.user.findMany({
        where: filters,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          passwordUpdatedAt: true,
          forcePasswordReset: true,
        },
        orderBy: {
          createdAt: sort === 'asc' ? 'asc' : 'desc',
        },
        skip,
        take: pageSize,
      }),
      prisma.user.count({ where: filters }),
    ]);

    return res.status(200).json({
      success: true,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      data: admins,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/* =====================================================
   RESET ADMIN PASSWORD
===================================================== */
export const resetAdminPassword = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required.' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.role === 'USER') {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        forcePasswordReset: true,
        passwordUpdatedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Admin password reset successfully.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/* =====================================================
   SOFT DELETE (Deactivate Admin)
===================================================== */
export const deactivateAdmin = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return res.status(200).json({
      success: true,
      message: 'Admin deactivated successfully.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/* =====================================================
   REACTIVATE ADMIN
===================================================== */
export const activateAdmin = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });

    return res.status(200).json({
      success: true,
      message: 'Admin activated successfully.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/* =====================================================
   HARD DELETE ADMIN (Optional)
===================================================== */
export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    await prisma.user.delete({
      where: { id: userId },
    });

    return res.status(200).json({
      success: true,
      message: 'Admin permanently deleted.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};