import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { generateToken, JwtPayload } from '../utils/jwt';
import { ConflictError, UnauthorizedError, NotFoundError, ValidationError } from '../utils/errors';
import { RegisterInput, LoginInput, ChangePasswordInput, ChangeFundsPasswordInput } from '../validations/authValidation';

const prisma = new PrismaClient();

const BCRYPT_SALT_ROUNDS = 10;

export class AuthService {
  async register(input: RegisterInput) {
    const { email, password, fundsPassword, firstName, lastName, phoneNumber } = input;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Check if phone number is already used
    if (phoneNumber) {
      const phoneExists = await prisma.user.findFirst({
        where: { phoneNumber },
      });
      if (phoneExists) {
        throw new ConflictError('Phone number already registered');
      }
    }

    // Hash passwords
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const hashedFundsPassword = await bcrypt.hash(fundsPassword, BCRYPT_SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fundsPassword: hashedFundsPassword,
        firstName,
        lastName,
        phoneNumber: phoneNumber || null,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
      },
    });

    // Create portfolio for user
    await prisma.portfolio.create({
      data: {
        userId: user.id,
      },
    });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    } as JwtPayload);

    return {
      user,
      token,
      message: 'Registration successful',
    };
  }

  async login(input: LoginInput) {
    const { email, password } = input;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    } as JwtPayload);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    };
  }

  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        portfolio: {
          select: {
            id: true,
            totalValue: true,
            totalInvested: true,
            totalPnL: true,
            pnlPercentage: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; phoneNumber?: string; email?: string }) {
    // Check if email is being updated and if it's already taken
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id: userId },
        },
      });
      if (existingUser) {
        throw new ConflictError('Email already in use');
      }
    }

    // Check if phone number is being updated and if it's already taken
    if (data.phoneNumber) {
      const existingUser = await prisma.user.findFirst({
        where: {
          phoneNumber: data.phoneNumber,
          NOT: { id: userId },
        },
      });
      if (existingUser) {
        throw new ConflictError('Phone number already in use');
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async changePassword(userId: string, input: ChangePasswordInput) {
    const { currentPassword, newPassword } = input;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Ensure new password is different from current
    if (await bcrypt.compare(newPassword, user.password)) {
      throw new ValidationError('New password must be different from current password');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async changeFundsPassword(userId: string, input: ChangeFundsPasswordInput) {
    const { currentFundsPassword, newFundsPassword } = input;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    if (!user.fundsPassword) {
      throw new NotFoundError('Funds password not set');
    }

    // Verify current funds password
    const isFundsPasswordValid = await bcrypt.compare(currentFundsPassword, user.fundsPassword);

    if (!isFundsPasswordValid) {
      throw new UnauthorizedError('Current funds password is incorrect');
    }

    // Ensure new funds password is different from current
    if (await bcrypt.compare(newFundsPassword, user.fundsPassword)) {
      throw new ValidationError('New funds password must be different from current funds password');
    }

    // Hash new funds password
    const hashedFundsPassword = await bcrypt.hash(newFundsPassword, BCRYPT_SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { fundsPassword: hashedFundsPassword },
    });

    return { message: 'Funds password changed successfully' };
  }

  async verifyFundsPassword(userId: string, fundsPassword: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.fundsPassword) {
      throw new NotFoundError('User');
    }

    return bcrypt.compare(fundsPassword, user.fundsPassword);
  }
}

export const authService = new AuthService();
