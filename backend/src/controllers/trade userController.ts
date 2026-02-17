import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { prisma } from '../prisma'; // or wherever your PrismaClient is exported
import { NotFoundError } from '../utils/errors';

class UserController {
  async getMyProfile(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return; // ✅ just return to exit, don't "return res"
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      balance: true,
      totalEarnings: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  res.status(200).json({ success: true, data: user }); // ✅ no "return" here
}

}

export const userController = new UserController();
