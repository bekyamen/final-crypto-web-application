import { Response } from "express";
import { PrismaClient, UserRole, TransactionType } from "@prisma/client";
import { AuthRequest } from "../middlewares/authMiddleware";

const prisma = new PrismaClient();

/**
 * ===============================
 * ADMIN: Add Balance to All Users
 * ===============================
 */
export const addBalanceToAllUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const adminId = req.user.id;
    const adminRole = req.user.role;

    const { amount, reason } = req.body;

    // 🔒 Only ADMIN or SUPER_ADMIN allowed
    if (adminRole !== UserRole.ADMIN && adminRole !== UserRole.SUPER_ADMIN) {
      res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    // ✅ Validate amount
    if (!amount || Number(amount) <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
      return;
    }

    // ✅ Get all active/signed-in users (or just all users)
    const users = await prisma.user.findMany(); // all users


    if (!users.length) {
      res.status(404).json({
        success: false,
        message: "No active users found",
      });
      return;
    }

    // 🔥 Transaction-safe batch update
    await prisma.$transaction(async (tx) => {
      for (const user of users) {
        // Update balancea
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: { balance: { increment: Number(amount) } },
        });

        // Create transaction record
        await tx.transaction.create({
          data: {
            userId: user.id,
            coinId: "USD",
            coinName: "USD",
            coinSymbol: "USD",
            type: TransactionType.DEPOSIT,
            quantity: Number(amount),
            price: 1,
            total: Number(amount),
            notes: reason || "Admin manual balance addition",
          },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            adminId,
            action: "ADMIN_ADD_BALANCE",
            targetUserId: user.id,
            entityType: "User",
            entityId: user.id,
            changes: {
              amountAdded: Number(amount),
              newBalance: updatedUser.balance,
            },
            reason,
          },
        });
      }
    });

    res.status(200).json({
      success: true,
      message: `Balance of ${amount} added for ${users.length} users`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
