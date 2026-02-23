import { Response } from "express";
import { PrismaClient, UserRole, TransactionType } from "@prisma/client";
import { AuthRequest } from "../middlewares/authMiddleware";

const prisma = new PrismaClient();

/**
 * @desc  Admin adds or sets demo balance for all users, returning history for dashboard
 * @route POST /users/demo-balance/all
 * @body { amount: number, reason?: string, mode: "add" | "set" }
 * @access Admin / Super Admin
 */
export const setDemoBalanceForAllUsers = async (
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

    if (!(adminRole === UserRole.ADMIN || adminRole === UserRole.SUPER_ADMIN)) {
      res.status(403).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { amount, reason, mode } = req.body;

    if (amount === undefined || Number(amount) < 0) {
      res.status(400).json({ success: false, message: "Invalid amount" });
      return;
    }

    if (mode !== "set" && mode !== "add") {
      res.status(400).json({ success: false, message: "Invalid mode" });
      return;
    }

    const users = await prisma.user.findMany();
    if (!users.length) {
      res.status(404).json({ success: false, message: "No users found" });
      return;
    }

    // Store history for frontend
    const history: Array<{
      targetUserId: string;
      email: string;
      previousBalance: number;
      newBalance: number;
      amountAdded: number;
      reason?: string;
      action: "add" | "set";
    }> = [];

    // Transaction-safe update for all users
    await prisma.$transaction(async (tx) => {
      for (const user of users) {
        const oldBalance = user.demoBalance ?? 0;
        let newBalance: number;
        let addedAmount: number;

        if (mode === "add") {
          newBalance = oldBalance + Number(amount);
          addedAmount = Number(amount);
        } else {
          newBalance = Number(amount);
          addedAmount = newBalance - oldBalance; // can be negative if balance decreases
        }

        // Update user balance
        await tx.user.update({
  where: { id: user.id },
  data: { demoBalance: newBalance },
});

        // Create transaction record
        await tx.transaction.create({
          data: {
            userId: user.id,
            coinId: "USD_DEMO",
            coinName: "USD Demo",
            coinSymbol: "USD_DEMO",
            type: TransactionType.DEPOSIT,
            quantity: addedAmount,
            price: 1,
            total: addedAmount,
            notes: reason || `Admin demo balance ${mode === "add" ? "added" : "set"}`,
          },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            adminId,
            action: mode === "add" ? "ADMIN_ADD_DEMO_BALANCE" : "ADMIN_SET_DEMO_BALANCE",
            targetUserId: user.id,
            entityType: "User",
            entityId: user.id,
            changes: {
              previousBalance: oldBalance,
              newDemoBalance: newBalance,
              amount: addedAmount,
            },
            reason,
          },
        });

        // Add to response history
        history.push({
          targetUserId: user.id,
          email: user.email,
          previousBalance: oldBalance,
          newBalance,
          amountAdded: addedAmount,
          reason,
          action: mode,
        });
      }
    });

    // Return message + history
    res.status(200).json({
      success: true,
      message:
        mode === "add"
          ? `Demo balance of ${amount} added for ${users.length} users`
          : `Demo balance set to ${amount} for ${users.length} users`,
      data: history, // frontend can render added/set amounts in table
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};