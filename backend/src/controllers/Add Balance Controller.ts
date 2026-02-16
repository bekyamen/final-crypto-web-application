import { Response } from "express";
import { PrismaClient, UserRole, TransactionType } from "@prisma/client";
import { AuthRequest } from "../middlewares/authMiddleware";

const prisma = new PrismaClient();

/**
 * ===============================
 * ADMIN: Add Demo Balance to All Users
 * ===============================
 */
export const addDemoBalanceToAllUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const adminId = req.user.id;
    const adminRole = req.user.role;

    // 🔒 Only ADMIN or SUPER_ADMIN allowed
    if (!(adminRole === UserRole.ADMIN || adminRole === UserRole.SUPER_ADMIN)) {
      res.status(403).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { amount, reason } = req.body;

    // ✅ Validate amount
    if (!amount || Number(amount) <= 0) {
      res.status(400).json({ success: false, message: "Invalid amount" });
      return;
    }

    // ✅ Fetch all users
    const users = await prisma.user.findMany();

    if (!users.length) {
      res.status(404).json({ success: false, message: "No users found" });
      return;
    }

    // 🔹 Transaction-safe update
    await prisma.$transaction(async (tx) => {
      for (const user of users) {
        // Update only demoBalance
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: { demoBalance: { increment: Number(amount) } },
        });

        // Optional: Create a demo "transaction" log
        await tx.transaction.create({
          data: {
            userId: user.id,
            coinId: "USD_DEMO",
            coinName: "USD Demo",
            coinSymbol: "USD_DEMO",
            type: TransactionType.DEPOSIT,
            quantity: Number(amount),
            price: 1,
            total: Number(amount),
            notes: reason || "Admin demo balance addition",
          },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            adminId,
            action: "ADMIN_ADD_DEMO_BALANCE",
            targetUserId: user.id,
            entityType: "User",
            entityId: user.id,
            changes: {
              amountAdded: Number(amount),
              newDemoBalance: updatedUser.demoBalance,
            },
            reason,
          },
        });
      }
    });

    res.status(200).json({
      success: true,
      message: `Demo balance of ${amount} added for ${users.length} users`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
