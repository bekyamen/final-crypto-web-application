import { Response } from "express";
import { PrismaClient, UserRole, TransactionType } from "@prisma/client";
import { AuthRequest } from "../middlewares/authMiddleware";

const prisma = new PrismaClient();

/**
 * ===============================
 * ADMIN: Set or Add Demo Balance for All Users
 * ===============================
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

    // 🔒 Only ADMIN or SUPER_ADMIN allowed
    if (!(adminRole === UserRole.ADMIN || adminRole === UserRole.SUPER_ADMIN)) {
      res.status(403).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { amount, reason, mode } = req.body; // mode: "set" | "add"

    // ✅ Validate amount
    if (amount === undefined || Number(amount) < 0) {
      res.status(400).json({ success: false, message: "Invalid amount" });
      return;
    }

    // Validate mode
    if (mode !== "set" && mode !== "add") {
      res.status(400).json({ success: false, message: "Invalid mode, must be 'set' or 'add'" });
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
        let newBalance: number;

        if (mode === "add") {
          newBalance = (user.demoBalance ?? 0) + Number(amount);
        } else {
          newBalance = Number(amount);
        }

        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: { demoBalance: newBalance },
        });

        // Optional: Create a demo "transaction" log
        await tx.transaction.create({
          data: {
            userId: user.id,
            coinId: "USD_DEMO",
            coinName: "USD Demo",
            coinSymbol: "USD_DEMO",
            type: TransactionType.DEPOSIT,
            quantity: mode === "add" ? Number(amount) : newBalance,
            price: 1,
            total: mode === "add" ? Number(amount) : newBalance,
            notes: reason || `Admin demo balance ${mode === "add" ? "addition" : "set"}`,
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
              previousBalance: user.demoBalance,
              newDemoBalance: updatedUser.demoBalance,
              amount: Number(amount),
            },
            reason,
          },
        });
      }
    });

    res.status(200).json({
      success: true,
      message:
        mode === "add"
          ? `Demo balance of ${amount} added for ${users.length} users`
          : `Demo balance set to ${amount} for ${users.length} users`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
