import { Response } from 'express';
import { adminService } from '../services/adminService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { createSuccessResponse } from '../utils/errors';

export class AdminController {
  // ----------------- STATS -----------------
  async getStats(_req: AuthRequest, res: Response): Promise<void> {
    const stats = await adminService.getStats();
    res.status(200).json(createSuccessResponse(stats, 'Admin statistics retrieved successfully'));
  }

  // ----------------- USERS -----------------
  async getUsers(req: AuthRequest, res: Response): Promise<void> {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const users = await adminService.getUsers(limit, offset);
    res.status(200).json(createSuccessResponse(users, 'Users retrieved successfully'));
  }

  async getUserDetails(req: AuthRequest, res: Response): Promise<void> {
    const { userId } = req.params;
    const details = await adminService.getUserDetails(userId);

    if (!details) {
      res.status(404).json({
        success: false,
        message: 'User not found',
        errorCode: 'NOT_FOUND',
      });
      return;
    }

    res.status(200).json(createSuccessResponse(details, 'User details retrieved successfully'));
  }

  async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    const { userId } = req.params;

    try {
      const result = await adminService.deleteUserById(userId);
      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        data: result,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: 'Failed to delete user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async resetAdminPassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 8) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long',
        });
        return;
      }

      if (req.user?.role !== 'SUPER_ADMIN') {
        res.status(403).json({
          success: false,
          message: 'Super admin access required',
          errorCode: 'FORBIDDEN',
        });
        return;
      }

      await adminService.resetAdminPassword(req.user.id, userId, newPassword);

      res.status(200).json({
        success: true,
        message: 'Admin password reset successfully. User must change password on next login.',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to reset admin password',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // ----------------- TRANSACTIONS -----------------
  async getTransactions(req: AuthRequest, res: Response): Promise<void> {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const transactions = await adminService.getTransactions(limit, offset);
    res.status(200).json(createSuccessResponse(transactions, 'Transactions retrieved successfully'));
  }

  // ----------------- PORTFOLIOS -----------------
  async getPortfolios(req: AuthRequest, res: Response): Promise<void> {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const portfolios = await adminService.getPortfolios(limit, offset);
    res.status(200).json(createSuccessResponse(portfolios, 'Portfolios retrieved successfully'));
  }

  async getTopPortfolios(_req: AuthRequest, res: Response): Promise<void> {
    const portfolios = await adminService.getTopPortfolios();
    res.status(200).json(createSuccessResponse(portfolios, 'Top portfolios retrieved successfully'));
  }

  // ----------------- MARKET -----------------
  async getMostTradedCoins(_req: AuthRequest, res: Response): Promise<void> {
    const coins = await adminService.getMostTradedCoins();
    res.status(200).json(createSuccessResponse(coins, 'Most traded coins retrieved successfully'));
  }

  async getMarketMetrics(_req: AuthRequest, res: Response): Promise<void> {
    const metrics = await adminService.getMarketMetrics();
    res.status(200).json(createSuccessResponse(metrics, 'Market metrics retrieved successfully'));
  }

  // ----------------- AUDIT LOGS -----------------
  async getAuditLogs(req: AuthRequest, res: Response): Promise<void> {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const logs = await adminService.getAuditLogs(limit, offset);
    res.status(200).json(createSuccessResponse(logs, 'Audit logs retrieved successfully'));
  }

  // ----------------- CONTACTS -----------------
  async getContacts(_req: AuthRequest, res: Response): Promise<void> {
    const contacts = await adminService.getContacts();
    res.status(200).json(createSuccessResponse(contacts, 'Contacts retrieved successfully'));
  }

  async addOrUpdateContact(req: AuthRequest, res: Response): Promise<void> {
    const { platform, value } = req.body;
    try {
      const contact = await adminService.addOrUpdateContact(platform, value);
      res.status(200).json(createSuccessResponse(contact, 'Contact saved successfully'));
    } catch (err) {
      res.status(400).json({ success: false, message: 'Failed to save contact', error: err instanceof Error ? err.message : err });
    }
  }

  async deleteContact(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const deleted = await adminService.deleteContact(id);
      res.status(200).json(createSuccessResponse(deleted, 'Contact deleted successfully'));
    } catch (err) {
      res.status(404).json({ success: false, message: 'Failed to delete contact', error: err instanceof Error ? err.message : err });
    }
  }
}

export const adminController = new AdminController();
